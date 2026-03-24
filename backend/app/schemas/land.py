"""
Land schemas — parcel creation, update, and response.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Shared ───────────────────────────────────────────────

class LandBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    size: float = Field(..., gt=0, description="Hectares")
    elevation: Optional[float] = None
    soil_type: Optional[str] = Field(None, max_length=100)
    soil_ph: Optional[float] = Field(None, ge=0, le=14)
    organic_matter: Optional[float] = Field(None, ge=0, le=100)
    nitrogen: Optional[float] = Field(None, ge=0)
    phosphorus: Optional[float] = Field(None, ge=0)
    potassium: Optional[float] = Field(None, ge=0)
    irrigation_available: bool = False


# ── Create ───────────────────────────────────────────────

class LandCreate(LandBase):
    pass


# ── Update ───────────────────────────────────────────────

class LandUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    size: Optional[float] = Field(None, gt=0)
    elevation: Optional[float] = None
    soil_type: Optional[str] = Field(None, max_length=100)
    soil_ph: Optional[float] = Field(None, ge=0, le=14)
    organic_matter: Optional[float] = Field(None, ge=0, le=100)
    nitrogen: Optional[float] = Field(None, ge=0)
    phosphorus: Optional[float] = Field(None, ge=0)
    potassium: Optional[float] = Field(None, ge=0)
    irrigation_available: Optional[bool] = None


# ── DB representation ───────────────────────────────────

class LandInDB(LandBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


# ── API response ─────────────────────────────────────────

class LandResponse(LandInDB):
    pass
