"""
Elevation service using Open-Elevation API.

Fetches elevation in meters for a given latitude/longitude.
Falls back to a latitude-based heuristic when unavailable.

API docs: https://open-elevation.com/
"""

import logging
import math
from typing import Any, Dict

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class ElevationService:
    """Fetch elevation data from Open-Elevation API with fallback."""

    def __init__(self):
        self._base_url = settings.OPEN_ELEVATION_API_URL

    async def get_elevation(
        self,
        latitude: float,
        longitude: float,
    ) -> Dict[str, Any]:
        """
        Return elevation for a location.

        Keys: elevation_meters, data_source.
        """
        try:
            return await self._fetch_from_api(latitude, longitude)
        except Exception as exc:
            logger.warning("Open-Elevation API failed (%s), using fallback", exc)
            return self._synthetic(latitude, longitude)

    async def get_elevation_batch(
        self,
        coordinates: list,
    ) -> list:
        """
        Fetch elevation for multiple points.
        coordinates: list of [lat, lon] pairs.
        """
        try:
            return await self._fetch_batch(coordinates)
        except Exception as exc:
            logger.warning("Batch elevation failed (%s), using fallback", exc)
            return [self._synthetic(c[0], c[1]) for c in coordinates]

    # ── API fetch ────────────────────────────────────────

    async def _fetch_from_api(
        self, lat: float, lon: float
    ) -> Dict[str, Any]:
        url = f"{self._base_url}/lookup"
        payload = {"locations": [{"latitude": lat, "longitude": lon}]}

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()

        results = data.get("results", [])
        if not results:
            return self._synthetic(lat, lon)

        elevation = results[0].get("elevation", 0)

        return {
            "elevation_meters": round(float(elevation), 1),
            "data_source": "open-elevation",
        }

    async def _fetch_batch(self, coordinates: list) -> list:
        url = f"{self._base_url}/lookup"
        locations = [
            {"latitude": c[0], "longitude": c[1]}
            for c in coordinates
        ]
        payload = {"locations": locations}

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()

        results = []
        for r in data.get("results", []):
            results.append({
                "elevation_meters": round(float(r.get("elevation", 0)), 1),
                "data_source": "open-elevation",
            })
        return results

    # ── Synthetic fallback ───────────────────────────────

    @staticmethod
    def _synthetic(lat: float, lon: float) -> Dict[str, Any]:
        """Heuristic elevation based on geography."""
        # Coastal regions (near 0/180 lon) → lower, inland → higher
        # Mountain belts near Himalayas (28-35°N, 75-90°E)
        base = 200
        if 28 <= abs(lat) <= 35 and 75 <= lon <= 90:
            base = 1500  # Himalayan foothills
        elif 10 <= abs(lat) <= 25:
            base = 350  # Deccan plateau
        elif abs(lat) < 10:
            base = 50  # Coastal

        noise = 100 * math.sin(lat * 11.3 + lon * 5.7)
        elevation = max(0, base + noise)

        return {
            "elevation_meters": round(elevation, 1),
            "data_source": "synthetic",
        }


# Module-level singleton
elevation_service = ElevationService()
