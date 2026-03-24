"""
Analysis schemas — analysis requests and responses.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Shared ───────────────────────────────────────────────

class AnalysisBase(BaseModel):
    land_id: int


# ── Create (submit a new analysis) ──────────────────────

class AnalysisCreate(AnalysisBase):
    input_data: Optional[Dict[str, Any]] = None


# ── Update ───────────────────────────────────────────────

class AnalysisUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern=r"^(pending|processing|completed|failed)$")
    results: Optional[Dict[str, Any]] = None


# ── DB representation ───────────────────────────────────

class AnalysisInDB(AnalysisBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: str
    analysis_date: Optional[datetime] = None
    input_data: Optional[Dict[str, Any]] = None
    results: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime


# ── API response ─────────────────────────────────────────

class AnalysisResponse(AnalysisInDB):
    pass


class AnalysisBrief(BaseModel):
    """Lightweight version for list views."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    land_id: int
    status: str
    analysis_date: Optional[datetime] = None
    created_at: datetime
