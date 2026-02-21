"""
Land CRUD endpoints + location analysis.
"""

import asyncio
import math
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.land import Land
from app.models.user import User
from app.schemas.land import LandCreate, LandResponse, LandUpdate

router = APIRouter()


# ── Helpers ──────────────────────────────────────────────

def _get_user_land(land_id: int, user: User, db: Session) -> Land:
    """Fetch a land owned by the user, or raise 404."""
    land = db.query(Land).filter(Land.id == land_id, Land.user_id == user.id).first()
    if not land:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Land parcel not found",
        )
    return land


# ── POST / ──────────────────────────────────────────────

@router.post("/", response_model=LandResponse, status_code=status.HTTP_201_CREATED)
def create_land(
    payload: LandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new land parcel for the authenticated user."""
    land = Land(
        user_id=current_user.id,
        name=payload.name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        elevation=payload.elevation,
        size=payload.size,
        soil_type=payload.soil_type,
        soil_ph=payload.soil_ph,
        organic_matter=payload.organic_matter,
        nitrogen=payload.nitrogen,
        phosphorus=payload.phosphorus,
        potassium=payload.potassium,
        irrigation_available=payload.irrigation_available,
    )
    db.add(land)
    db.commit()
    db.refresh(land)
    return land


# ── GET / ────────────────────────────────────────────────

@router.get("/", response_model=list[LandResponse])
def list_lands(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    soil_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List the current user's land parcels with optional filtering."""
    query = db.query(Land).filter(Land.user_id == current_user.id)

    if soil_type:
        query = query.filter(Land.soil_type.ilike(f"%{soil_type}%"))

    return query.order_by(Land.created_at.desc()).offset(skip).limit(limit).all()


# ── GET /{land_id} ──────────────────────────────────────

@router.get("/{land_id}", response_model=LandResponse)
def get_land(
    land_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific land parcel by ID."""
    return _get_user_land(land_id, current_user, db)


# ── PUT /{land_id} ──────────────────────────────────────

@router.put("/{land_id}", response_model=LandResponse)
def update_land(
    land_id: int,
    payload: LandUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing land parcel."""
    land = _get_user_land(land_id, current_user, db)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(land, field, value)

    db.commit()
    db.refresh(land)
    return land


# ── DELETE /{land_id} ───────────────────────────────────

@router.delete("/{land_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_land(
    land_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a land parcel and its related analyses (cascade)."""
    land = _get_user_land(land_id, current_user, db)
    db.delete(land)
    db.commit()
    return None


# ══════════════════════════════════════════════════════════
# Issue #26 — Analyze Location (polygon → environmental data)
# ══════════════════════════════════════════════════════════


class AnalyzeLocationRequest(BaseModel):
    """Polygon coordinates or a single point for location analysis."""
    polygon: Optional[List[List[float]]] = Field(
        None,
        description="List of [lat, lng] pairs forming a polygon boundary",
        min_length=3,
    )
    latitude: Optional[float] = Field(None, description="Single point latitude")
    longitude: Optional[float] = Field(None, description="Single point longitude")


def _polygon_area_hectares(coords: List[List[float]]) -> float:
    """
    Calculate polygon area in hectares using the Shoelace formula
    with lat/lon → meter conversion.
    """
    if len(coords) < 3:
        return 0.0

    n = len(coords)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        lat1, lon1 = math.radians(coords[i][0]), math.radians(coords[i][1])
        lat2, lon2 = math.radians(coords[j][0]), math.radians(coords[j][1])
        area += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))

    area = abs(area) * 6378137.0 ** 2 / 2.0  # Earth radius squared
    return round(area / 10000, 4)  # m² → hectares


def _polygon_centroid(coords: List[List[float]]) -> dict:
    """Calculate the centroid of a polygon."""
    n = len(coords)
    lat_sum = sum(c[0] for c in coords) / n
    lon_sum = sum(c[1] for c in coords) / n
    return {"latitude": round(lat_sum, 6), "longitude": round(lon_sum, 6)}


@router.post("/analyze-location")
async def analyze_location(payload: AnalyzeLocationRequest):
    """
    Analyze a location: calculate area from polygon, fetch soil,
    elevation, and climate data from external APIs in parallel.

    Accepts either a polygon (list of [lat,lng] points) or a
    single lat/lng point.
    """
    from app.services.soil_data_service import soil_data_service
    from app.services.elevation_service import elevation_service
    from app.services.climate_service import climate_service

    # Determine centroid and area
    if payload.polygon and len(payload.polygon) >= 3:
        centroid = _polygon_centroid(payload.polygon)
        area_hectares = _polygon_area_hectares(payload.polygon)
        lat = centroid["latitude"]
        lon = centroid["longitude"]
    elif payload.latitude is not None and payload.longitude is not None:
        lat = payload.latitude
        lon = payload.longitude
        centroid = {"latitude": lat, "longitude": lon}
        area_hectares = None  # single point, no area
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either a polygon (≥3 points) or latitude+longitude",
        )

    # Fetch all data in parallel
    soil_task = soil_data_service.get_soil_data(lat, lon)
    elevation_task = elevation_service.get_elevation(lat, lon)
    climate_task = climate_service.get_climate_data(lat, lon)

    soil, elevation, climate = await asyncio.gather(
        soil_task, elevation_task, climate_task
    )

    return {
        "centroid": centroid,
        "area_hectares": area_hectares,
        "polygon_points": len(payload.polygon) if payload.polygon else 0,
        "soil": soil,
        "elevation": elevation,
        "climate": climate,
    }

