"""
Recommendation schemas — crop suggestions from an analysis.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Shared ───────────────────────────────────────────────

class RecommendationBase(BaseModel):
    crop_id: int
    suitability_score: float = Field(..., ge=0, le=100)
    predicted_yield: Optional[float] = Field(None, ge=0)
    estimated_profit: Optional[float] = None
    confidence_level: Optional[float] = Field(None, ge=0, le=1)
    rank: Optional[int] = Field(None, ge=1)
    notes: Optional[str] = None


# ── Create ───────────────────────────────────────────────

class RecommendationCreate(RecommendationBase):
    analysis_id: int


# ── Update ───────────────────────────────────────────────

class RecommendationUpdate(BaseModel):
    suitability_score: Optional[float] = Field(None, ge=0, le=100)
    predicted_yield: Optional[float] = Field(None, ge=0)
    estimated_profit: Optional[float] = None
    confidence_level: Optional[float] = Field(None, ge=0, le=1)
    rank: Optional[int] = Field(None, ge=1)
    notes: Optional[str] = None


# ── DB representation ───────────────────────────────────

class RecommendationInDB(RecommendationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    analysis_id: int
    created_at: datetime
    updated_at: datetime


# ── API response ─────────────────────────────────────────

class RecommendationResponse(RecommendationInDB):
    pass


class RecommendationWithCrop(RecommendationResponse):
    """Extended response including crop name."""
    crop_name: Optional[str] = None
