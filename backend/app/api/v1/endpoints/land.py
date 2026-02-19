"""
Land CRUD endpoints — create, list, get, update, delete.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
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
