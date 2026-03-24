"""
Crop schemas — reference crop data.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Shared ───────────────────────────────────────────────

class CropBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    scientific_name: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    water_requirement: Optional[float] = Field(None, ge=0)
    growth_duration: Optional[int] = Field(None, gt=0, description="Days")
    optimal_ph_min: Optional[float] = Field(None, ge=0, le=14)
    optimal_ph_max: Optional[float] = Field(None, ge=0, le=14)
    preferred_soil_types: Optional[str] = Field(None, max_length=255)


# ── Create ───────────────────────────────────────────────

class CropCreate(CropBase):
    pass


# ── Update ───────────────────────────────────────────────

class CropUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    scientific_name: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    optimal_temp_min: Optional[float] = None
    optimal_temp_max: Optional[float] = None
    water_requirement: Optional[float] = Field(None, ge=0)
    growth_duration: Optional[int] = Field(None, gt=0)
    optimal_ph_min: Optional[float] = Field(None, ge=0, le=14)
    optimal_ph_max: Optional[float] = Field(None, ge=0, le=14)
    preferred_soil_types: Optional[str] = Field(None, max_length=255)


# ── DB representation ───────────────────────────────────

class CropInDB(CropBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# ── API response ─────────────────────────────────────────

class CropResponse(CropInDB):
    pass
