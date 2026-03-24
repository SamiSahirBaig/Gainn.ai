"""
Models package — import all models here so Alembic and Base.metadata see them.
"""

from app.models.user import User
from app.models.land import Land
from app.models.crop import Crop
from app.models.analysis import Analysis
from app.models.recommendation import Recommendation
from app.models.market import MarketData

__all__ = [
    "User",
    "Land",
    "Crop",
    "Analysis",
    "Recommendation",
    "MarketData",
]
