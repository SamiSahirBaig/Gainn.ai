"""
Schemas package — re-export all schemas for convenient imports.
"""

from app.schemas.token import Token, TokenPayload
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserInDB, UserResponse
from app.schemas.land import LandBase, LandCreate, LandUpdate, LandInDB, LandResponse
from app.schemas.crop import CropBase, CropCreate, CropUpdate, CropInDB, CropResponse
from app.schemas.analysis import (
    AnalysisBase, AnalysisCreate, AnalysisUpdate, AnalysisInDB, AnalysisResponse, AnalysisBrief,
)
from app.schemas.recommendation import (
    RecommendationBase, RecommendationCreate, RecommendationUpdate,
    RecommendationInDB, RecommendationResponse, RecommendationWithCrop,
)

__all__ = [
    "Token", "TokenPayload",
    "UserBase", "UserCreate", "UserUpdate", "UserInDB", "UserResponse",
    "LandBase", "LandCreate", "LandUpdate", "LandInDB", "LandResponse",
    "CropBase", "CropCreate", "CropUpdate", "CropInDB", "CropResponse",
    "AnalysisBase", "AnalysisCreate", "AnalysisUpdate", "AnalysisInDB", "AnalysisResponse", "AnalysisBrief",
    "RecommendationBase", "RecommendationCreate", "RecommendationUpdate",
    "RecommendationInDB", "RecommendationResponse", "RecommendationWithCrop",
]
