"""
Climate data service using OpenWeatherMap API.

Fetches temperature, humidity, and rainfall data for a location.
Falls back to latitude/seasonal heuristics when unavailable.

API docs: https://openweathermap.org/api
"""

import logging
import math
from datetime import datetime, timezone
from typing import Any, Dict

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


# Rainfall pattern thresholds (mm/year)
def _classify_rainfall(annual_mm: float) -> str:
    if annual_mm < 600:
        return "low"
    if annual_mm < 1000:
        return "moderate"
    if annual_mm < 1800:
        return "high"
    return "very-high"


class ClimateService:
    """Fetch climate data from OpenWeatherMap with synthetic fallback."""

    def __init__(self):
        self._api_key = settings.OPENWEATHERMAP_API_KEY
        self._available = bool(self._api_key) and self._api_key != "your_openweathermap_api_key_here"

    async def get_climate_data(
        self,
        latitude: float,
        longitude: float,
    ) -> Dict[str, Any]:
        """
        Return climate data for a location.

        Keys: temperature, humidity, rainfall_annual, rainfall_pattern,
              wind_speed, weather_description, data_source.
        """
        if not self._available:
            return self._synthetic(latitude, longitude)

        try:
            return await self._fetch_from_api(latitude, longitude)
        except Exception as exc:
            logger.warning("OpenWeatherMap API failed (%s), using fallback", exc)
            return self._synthetic(latitude, longitude)

    # ── API fetch ────────────────────────────────────────

    async def _fetch_from_api(
        self, lat: float, lon: float
    ) -> Dict[str, Any]:
        # Current weather for temperature/humidity
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self._api_key,
            "units": "metric",
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        main = data.get("main", {})
        wind = data.get("wind", {})
        weather = data.get("weather", [{}])[0]

        temp = main.get("temp", 25)
        humidity = main.get("humidity", 60)

        # Estimate annual rainfall from current conditions
        # (OpenWeatherMap free tier doesn't give historical rainfall easily)
        rain_1h = data.get("rain", {}).get("1h", 0)
        # Rough annual estimate based on region
        annual_rainfall = self._estimate_annual_rainfall(lat, lon, humidity)

        return {
            "temperature": round(float(temp), 1),
            "humidity": round(float(humidity), 1),
            "rainfall_annual": round(annual_rainfall),
            "rainfall_pattern": _classify_rainfall(annual_rainfall),
            "wind_speed": round(float(wind.get("speed", 0)), 1),
            "weather_description": weather.get("description", ""),
            "data_source": "openweathermap",
        }

    @staticmethod
    def _estimate_annual_rainfall(lat: float, lon: float, humidity: float) -> float:
        """Estimate annual rainfall from location and current humidity."""
        # India-specific rainfall patterns
        if 8 <= lat <= 12 and 74 <= lon <= 80:  # Kerala / Western Ghats
            return 2500 + humidity * 5
        if 20 <= lat <= 28 and 70 <= lon <= 80:  # Central India
            return 800 + humidity * 8
        if 22 <= lat <= 27 and 85 <= lon <= 95:  # NE India
            return 2000 + humidity * 10
        if 28 <= lat <= 35 and 75 <= lon <= 80:  # North India
            return 600 + humidity * 5
        # Generic tropical
        if abs(lat) < 23:
            return 1200 + humidity * 6
        return 700 + humidity * 4

    # ── Synthetic fallback ───────────────────────────────

    @staticmethod
    def _synthetic(lat: float, lon: float) -> Dict[str, Any]:
        """Temperature/rainfall heuristics based on latitude and season."""
        now = datetime.now(timezone.utc)
        month = now.month

        # Base temperature decreases away from equator
        base_temp = 30 - abs(lat - 15) * 0.4
        # Seasonal variation (warmer Apr-Jun, cooler Dec-Jan for India)
        seasonal = 3 * math.sin(2 * math.pi * (month - 4) / 12)
        temp = round(max(5, min(45, base_temp + seasonal)), 1)

        # Humidity
        humidity = round(50 + 20 * math.sin(2 * math.pi * (month - 7) / 12), 1)

        # Annual rainfall based on region
        if abs(lat) < 10:
            rainfall = 2000
        elif abs(lat) < 23:
            rainfall = 1100 + 200 * math.sin(lon * 0.1)
        else:
            rainfall = 600 + 100 * math.sin(lon * 0.1)

        return {
            "temperature": temp,
            "humidity": humidity,
            "rainfall_annual": round(rainfall),
            "rainfall_pattern": _classify_rainfall(rainfall),
            "wind_speed": round(5 + 3 * abs(math.sin(lat * 0.2)), 1),
            "weather_description": "estimated from location",
            "data_source": "synthetic",
        }


# Module-level singleton
climate_service = ClimateService()
