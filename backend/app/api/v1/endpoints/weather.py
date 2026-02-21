"""
Weather endpoint — current conditions, forecast, and farming recommendations.
"""

from fastapi import APIRouter, Query

from app.services.weather_service import get_full_weather

router = APIRouter()


@router.get("/current")
async def get_current_weather(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
):
    """
    Get current weather, 5-day forecast, and farming recommendations.
    Uses OpenWeatherMap API with synthetic fallback.
    """
    return await get_full_weather(lat, lng)
