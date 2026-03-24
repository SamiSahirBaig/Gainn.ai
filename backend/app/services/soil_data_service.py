"""
Soil data service using ISRIC SoilGrids API.

Fetches soil properties (type, pH, organic carbon, NPK) for a given
latitude/longitude.  Falls back to synthetic estimates when the API
is unavailable.

API docs: https://rest.isric.org/soilgrids/v2.0/docs
"""

import logging
import math
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# SoilGrids property codes → human-readable depth 0-30 cm
_SG_PROPERTIES = ["phh2o", "soc", "nitrogen", "clay", "sand", "silt"]
_SG_DEPTH = "0-30cm"


# ── Soil type inference ──────────────────────────────────────

_SOIL_TYPES = {
    "sandy": {"sand_min": 70},
    "clay": {"clay_min": 40},
    "silty": {"silt_min": 60},
    "loamy": {"default": True},
    "sandy loam": {"sand_min": 50, "clay_max": 20},
    "clay loam": {"clay_min": 25, "sand_max": 45},
}


def _infer_soil_type(clay: float, sand: float, silt: float) -> str:
    """Simple USDA texture triangle approximation."""
    if sand >= 70:
        return "sandy"
    if clay >= 40:
        return "clay"
    if silt >= 60:
        return "silty"
    if clay >= 25 and sand <= 45:
        return "clay loam"
    if sand >= 50 and clay <= 20:
        return "sandy loam"
    return "loamy"


# ── Main service ─────────────────────────────────────────────

class SoilDataService:
    """Fetch soil properties from SoilGrids API with synthetic fallback."""

    def __init__(self):
        self._base_url = settings.SOILGRIDS_API_URL

    async def get_soil_data(
        self,
        latitude: float,
        longitude: float,
    ) -> Dict[str, Any]:
        """
        Return soil data for a location.

        Keys: soil_type, ph_level, organic_matter, nitrogen,
              phosphorus, potassium, clay_pct, sand_pct, silt_pct,
              data_source.
        """
        try:
            return await self._fetch_from_api(latitude, longitude)
        except Exception as exc:
            logger.warning("SoilGrids API failed (%s), using synthetic fallback", exc)
            return self._synthetic(latitude, longitude)

    # ── API fetch ────────────────────────────────────────

    async def _fetch_from_api(
        self, lat: float, lon: float
    ) -> Dict[str, Any]:
        url = f"{self._base_url}/properties/query"
        params = {
            "lat": lat,
            "lon": lon,
            "property": _SG_PROPERTIES,
            "depth": _SG_DEPTH,
            "value": "mean",
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        props = {}
        for layer in data.get("properties", {}).get("layers", []):
            name = layer["name"]
            depths = layer.get("depths", [])
            if depths:
                val = depths[0].get("values", {}).get("mean")
                props[name] = val

        # SoilGrids returns pH * 10, soc in dg/kg, nitrogen in cg/kg
        ph = (props.get("phh2o") or 65) / 10.0
        soc = (props.get("soc") or 15) / 10.0  # → g/kg
        organic_matter = round(soc * 1.724, 2)  # Van Bemmelen factor
        nitrogen_val = (props.get("nitrogen") or 200) / 100.0  # → g/kg → estimate mg/kg
        clay = (props.get("clay") or 250) / 10.0  # g/kg → %
        sand = (props.get("sand") or 400) / 10.0
        silt = (props.get("silt") or 350) / 10.0

        soil_type = _infer_soil_type(clay, sand, silt)

        return {
            "soil_type": soil_type,
            "ph_level": round(ph, 1),
            "organic_matter": organic_matter,
            "nitrogen": round(nitrogen_val * 50, 0),  # approximate mg/kg
            "phosphorus": round(nitrogen_val * 15, 0),  # heuristic
            "potassium": round(nitrogen_val * 40, 0),  # heuristic
            "clay_pct": round(clay, 1),
            "sand_pct": round(sand, 1),
            "silt_pct": round(silt, 1),
            "data_source": "soilgrids",
        }

    # ── Synthetic fallback ───────────────────────────────

    @staticmethod
    def _synthetic(lat: float, lon: float) -> Dict[str, Any]:
        """Deterministic synthetic soil data based on lat/lon."""
        # Tropical / subtropical → higher organic matter
        base_ph = 6.5 + 0.5 * math.sin(lat * 0.1 + lon * 0.05)
        base_ph = round(max(4.5, min(8.5, base_ph)), 1)

        noise = abs(math.sin(lat * 13.7 + lon * 7.3))

        soil_types = ["loamy", "clay loam", "sandy loam", "clay", "sandy", "silty"]
        idx = int(abs(lat * 3 + lon * 7)) % len(soil_types)

        return {
            "soil_type": soil_types[idx],
            "ph_level": base_ph,
            "organic_matter": round(1.5 + noise * 3.0, 2),
            "nitrogen": round(150 + noise * 200),
            "phosphorus": round(20 + noise * 60),
            "potassium": round(100 + noise * 250),
            "clay_pct": round(15 + noise * 30, 1),
            "sand_pct": round(20 + noise * 40, 1),
            "silt_pct": round(20 + noise * 30, 1),
            "data_source": "synthetic",
        }


# Module-level singleton
soil_data_service = SoilDataService()
