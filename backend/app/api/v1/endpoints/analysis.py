"""
Analysis endpoints — create analysis, list, details, recommendations, simulation.

Now integrates NDVI satellite imagery (Issue #15) into the scoring pipeline.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.analysis import Analysis
from app.models.land import Land
from app.models.user import User
from app.ml.suitability import calculate_suitability, simulate_scenario
from app.schemas.analysis import AnalysisCreate, AnalysisResponse, AnalysisBrief
from app.services.ndvi_service import ndvi_service

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────

def _get_user_analysis(analysis_id: int, user: User, db: Session) -> Analysis:
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis


def _land_to_ml_input(land: Land, extra: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Convert a Land ORM object to a dict consumable by the ML engine."""
    data: Dict[str, Any] = {
        "soil_type": land.soil_type,
        "soil_ph": land.soil_ph,
        "organic_matter": land.organic_matter,
        "nitrogen": land.nitrogen,
        "phosphorus": land.phosphorus,
        "potassium": land.potassium,
        "irrigation_available": land.irrigation_available,
        "elevation": land.elevation,
        "latitude": land.latitude,
        "longitude": land.longitude,
        "size": land.size,
    }
    if extra:
        data.update(extra)
    return data


# ── POST / ──────────────────────────────────────────────

@router.post("/", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def create_analysis(
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Run a new crop-suitability analysis on an existing land parcel.

    Pipeline:
    1. Fetch NDVI satellite data for the land's coordinates
    2. Merge land properties + climate info + NDVI features
    3. Run suitability scoring engine
    4. Store results and return
    """
    # Verify land ownership
    land = db.query(Land).filter(Land.id == payload.land_id, Land.user_id == current_user.id).first()
    if not land:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Land parcel not found")

    # Build ML input
    ml_input = _land_to_ml_input(land, extra=payload.input_data)

    # Fetch NDVI satellite features (falls back to synthetic if unavailable)
    ndvi_features = {}
    if land.latitude is not None and land.longitude is not None:
        ndvi_features = ndvi_service.calculate_ndvi_features(
            latitude=land.latitude,
            longitude=land.longitude,
        )
        ml_input.update(ndvi_features)

    # Create analysis record — mark processing
    analysis = Analysis(
        user_id=current_user.id,
        land_id=land.id,
        status="processing",
        analysis_date=datetime.now(timezone.utc),
        input_data=ml_input,
    )
    db.add(analysis)
    db.flush()  # get id

    # Run ML engine
    try:
        scores = calculate_suitability(ml_input)
        top_5 = scores[:5]

        analysis.results = {
            "all_scores": scores,
            "top_recommendations": top_5,
            "total_crops_evaluated": len(scores),
            "best_crop": top_5[0]["name"] if top_5 else None,
            "best_score": top_5[0]["suitability_score"] if top_5 else 0,
            "ndvi_data": ndvi_features,
        }
        analysis.status = "completed"
    except Exception as exc:
        analysis.status = "failed"
        analysis.results = {"error": str(exc)}

    db.commit()
    db.refresh(analysis)
    return analysis


# ── GET / ────────────────────────────────────────────────

@router.get("/", response_model=list[AnalysisBrief])
def list_analyses(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    land_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List the current user's analyses with optional filtering."""
    q = db.query(Analysis).filter(Analysis.user_id == current_user.id)
    if status_filter:
        q = q.filter(Analysis.status == status_filter)
    if land_id is not None:
        q = q.filter(Analysis.land_id == land_id)
    return q.order_by(Analysis.created_at.desc()).offset(skip).limit(limit).all()


# ── GET /{analysis_id} ─────────────────────────────────

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full analysis details including results."""
    return _get_user_analysis(analysis_id, current_user, db)


# ── GET /{analysis_id}/recommendations ──────────────────

@router.get("/{analysis_id}/recommendations")
def get_recommendations(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return top-5 crop recommendations from a completed analysis,
    sorted by suitability score descending.
    """
    analysis = _get_user_analysis(analysis_id, current_user, db)

    if analysis.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Analysis is not completed (status: {analysis.status})",
        )

    results = analysis.results or {}
    return {
        "analysis_id": analysis.id,
        "land_id": analysis.land_id,
        "recommendations": results.get("top_recommendations", []),
        "ndvi_data": results.get("ndvi_data"),
    }


# ── GET /{analysis_id}/ndvi ─────────────────────────────

@router.get("/{analysis_id}/ndvi")
def get_ndvi_data(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return the NDVI satellite data captured during this analysis.
    Includes current stats, time series, and derived ML features.
    """
    analysis = _get_user_analysis(analysis_id, current_user, db)
    results = analysis.results or {}
    ndvi = results.get("ndvi_data", {})

    # If NDVI wasn't stored (legacy analysis), fetch it now
    if not ndvi and analysis.input_data:
        lat = analysis.input_data.get("latitude")
        lon = analysis.input_data.get("longitude")
        if lat is not None and lon is not None:
            ndvi = ndvi_service.calculate_ndvi_features(lat, lon)

    # Also get the time series for visualization
    time_series = []
    if analysis.input_data:
        lat = analysis.input_data.get("latitude")
        lon = analysis.input_data.get("longitude")
        if lat is not None and lon is not None:
            time_series = ndvi_service.get_ndvi_time_series(lat, lon, months_back=12)

    return {
        "analysis_id": analysis.id,
        "ndvi_features": ndvi,
        "time_series": time_series,
    }


# ── POST /{analysis_id}/simulate ────────────────────────

@router.post("/{analysis_id}/simulate")
def run_simulation(
    analysis_id: int,
    scenario: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Re-run analysis with modified climate parameters.

    Body example:
    ```json
    {"temp_change": 2.0, "rainfall_change": -100}
    ```
    """
    analysis = _get_user_analysis(analysis_id, current_user, db)

    if analysis.status != "completed" or not analysis.input_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot simulate on an incomplete analysis",
        )

    scores = simulate_scenario(
        land_data=analysis.input_data,
        temp_change=scenario.get("temp_change", 0.0),
        rainfall_change=scenario.get("rainfall_change", 0.0),
    )

    return {
        "analysis_id": analysis.id,
        "scenario": scenario,
        "original_best": (analysis.results or {}).get("best_crop"),
        "simulated_recommendations": scores[:5],
        "all_scores": scores,
    }
