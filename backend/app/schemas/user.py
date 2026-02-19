"""
User schemas — registration, login, profile.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Shared ───────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=255)


# ── Create ───────────────────────────────────────────────

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


# ── Update ───────────────────────────────────────────────

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=255)
    password: Optional[str] = Field(None, min_length=8, max_length=128)


# ── DB representation ───────────────────────────────────

class UserInDB(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    is_superuser: bool
    hashed_password: str
    created_at: datetime
    updated_at: datetime


# ── API response ─────────────────────────────────────────

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
