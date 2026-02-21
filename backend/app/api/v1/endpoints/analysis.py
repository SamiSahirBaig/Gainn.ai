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
    Return top-5 crop recommendations with enriched data:
    cost breakdown, market info, season, and profit analysis.
    """
    from app.ml.profit_calculator import profit_calculator

    analysis = _get_user_analysis(analysis_id, current_user, db)

    if analysis.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Analysis is not completed (status: {analysis.status})",
        )

    results = analysis.results or {}
    raw_recs = results.get("top_recommendations", [])

    # Get land size for cost scaling
    land = db.query(Land).filter(Land.id == analysis.land_id).first()
    land_size = land.size if land and land.size else 1.0

    # Load crop requirements for season data
    import json
    from pathlib import Path
    crop_db_path = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "data" / "crop_requirements.json"
    with open(crop_db_path) as f:
        crop_db = {c["name"]: c for c in json.load(f)}

    enriched = []
    for rec in raw_recs:
        crop_name = rec.get("name", "")
        predicted_yield = rec.get("predicted_yield", 0)

        # Get detailed profit breakdown
        profit_data = profit_calculator.calculate_profit(
            crop_name, predicted_yield, land_size
        )

        # Get season data from crop_requirements
        crop_info = crop_db.get(crop_name, {})

        enriched.append({
            **rec,
            # Profit & cost data
            "revenue": profit_data.get("revenue", 0),
            "total_cost": profit_data.get("costs", {}).get("total_cost", 0),
            "profit": profit_data.get("profit", 0),
            "roi": profit_data.get("roi", 0),
            "profit_per_hectare": profit_data.get("profit_per_hectare", 0),
            "cost_breakdown": profit_data.get("costs", {}).get("per_hectare", {}),
            # Market data
            "market_info": profit_data.get("market_info", {}),
            # Season data
            "season_name": crop_info.get("season_name", "—"),
            "sowing_months": crop_info.get("sowing_months", []),
            "harvest_months": crop_info.get("harvest_months", []),
            # Growing requirements
            "growth_duration": crop_info.get("growth_duration", rec.get("growth_duration")),
            "temp_range": f"{crop_info.get('temp_min', '?')}–{crop_info.get('temp_max', '?')} °C" if crop_info else None,
            "rainfall_range": f"{crop_info.get('rainfall_min', '?')}–{crop_info.get('rainfall_max', '?')} mm" if crop_info else None,
            "irrigation_required": crop_info.get("irrigation_required"),
            "soil_types": crop_info.get("soil_types", []),
            "land_size": land_size,
        })

    return {
        "analysis_id": analysis.id,
        "land_id": analysis.land_id,
        "land_size": land_size,
        "recommendations": enriched,
        "ndvi_data": results.get("ndvi_data"),
    }


# ── GET /{analysis_id}/crop/{crop_name}/detail ──────────

@router.get("/{analysis_id}/crop/{crop_name}/detail")
def get_crop_detail(
    analysis_id: int,
    crop_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deep-dive analysis for a single crop — full cost breakdown,
    market info, growing requirements, and yield confidence interval.
    """
    from app.ml.profit_calculator import profit_calculator
    from app.ml.yield_prediction import yield_predictor

    analysis = _get_user_analysis(analysis_id, current_user, db)

    if analysis.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Analysis is not completed (status: {analysis.status})",
        )

    # Find this crop in the analysis results
    results = analysis.results or {}
    all_scores = results.get("all_scores", [])
    crop_score = next((c for c in all_scores if c["name"] == crop_name), None)
    if not crop_score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Crop '{crop_name}' not found in analysis results",
        )

    # Get land size
    land = db.query(Land).filter(Land.id == analysis.land_id).first()
    land_size = land.size if land and land.size else 1.0

    # Detailed profit breakdown
    predicted_yield = crop_score.get("predicted_yield", 0)
    profit_data = profit_calculator.calculate_profit(
        crop_name, predicted_yield, land_size
    )

    # Yield prediction with confidence interval
    input_data = analysis.input_data or {}
    try:
        yield_data = yield_predictor.predict(input_data, crop_name)
    except Exception:
        yield_data = {
            "predicted_yield": predicted_yield,
            "min_yield": round(predicted_yield * 0.7, 2),
            "max_yield": round(predicted_yield * 1.3, 2),
            "confidence": crop_score.get("confidence", 0.5),
        }

    # Load crop requirements for growing guide
    import json
    from pathlib import Path
    crop_db_path = Path(__file__).resolve().parent.parent.parent.parent / "ml" / "data" / "crop_requirements.json"
    with open(crop_db_path) as f:
        crop_db = {c["name"]: c for c in json.load(f)}
    crop_info = crop_db.get(crop_name, {})

    # Group costs by phase
    cost_per_ha = profit_data.get("costs", {}).get("per_hectare", {})
    cost_phases = {
        "pre_sowing": {
            "seeds": cost_per_ha.get("seeds", 0),
            "sowing": cost_per_ha.get("sowing", 0),
        },
        "growing": {
            "fertilizer": cost_per_ha.get("fertilizer", 0),
            "pesticide": cost_per_ha.get("pesticide", 0),
            "irrigation": cost_per_ha.get("irrigation", 0),
            "labor": cost_per_ha.get("labor", 0),
            "equipment": cost_per_ha.get("equipment", 0),
        },
        "harvest": {
            "harvesting": cost_per_ha.get("harvesting", 0),
        },
        "post_harvest": {
            "transport": cost_per_ha.get("transport", 0),
            "storage": cost_per_ha.get("storage", 0),
            "misc": cost_per_ha.get("misc", 0),
        },
    }

    return {
        "analysis_id": analysis.id,
        "land_id": analysis.land_id,
        "land_size": land_size,
        "crop_name": crop_name,
        "suitability": crop_score,
        "profit": {
            "revenue": profit_data.get("revenue", 0),
            "total_cost": profit_data.get("costs", {}).get("total_cost", 0),
            "profit": profit_data.get("profit", 0),
            "roi": profit_data.get("roi", 0),
            "profit_per_hectare": profit_data.get("profit_per_hectare", 0),
        },
        "cost_breakdown": cost_per_ha,
        "cost_phases": cost_phases,
        "market_info": profit_data.get("market_info", {}),
        "yield_prediction": yield_data,
        "growing_guide": {
            "season_name": crop_info.get("season_name", "—"),
            "sowing_months": crop_info.get("sowing_months", []),
            "harvest_months": crop_info.get("harvest_months", []),
            "growth_duration": crop_info.get("growth_duration"),
            "temp_range": [crop_info.get("temp_min"), crop_info.get("temp_max")],
            "rainfall_range": [crop_info.get("rainfall_min"), crop_info.get("rainfall_max")],
            "water_requirement": crop_info.get("water_requirement"),
            "irrigation_required": crop_info.get("irrigation_required"),
            "soil_types": crop_info.get("soil_types", []),
            "ph_range": [crop_info.get("ph_min"), crop_info.get("ph_max")],
            "npk_required": {
                "nitrogen": crop_info.get("nitrogen"),
                "phosphorus": crop_info.get("phosphorus"),
                "potassium": crop_info.get("potassium"),
            },
        },
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
