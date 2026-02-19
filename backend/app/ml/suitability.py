"""
Crop suitability scoring engine.

Calculates a 0–100 compatibility score for each crop based on:
  Without NDVI:  Soil 30% + Climate 40% + Resource 20% + Economic 10%
  With NDVI:     Soil 25% + Climate 30% + Resource 15% + Economic 10% + NDVI 20%
"""

import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional

_DATA_DIR = Path(__file__).resolve().parent / "data"
_CROP_DB: Optional[List[Dict[str, Any]]] = None


def _load_crop_db() -> List[Dict[str, Any]]:
    """Lazy-load the crop requirements database."""
    global _CROP_DB
    if _CROP_DB is None:
        with open(_DATA_DIR / "crop_requirements.json") as f:
            _CROP_DB = json.load(f)
    return _CROP_DB


# ── Helper: range score ─────────────────────────────────

def _range_score(value: Optional[float], low: float, high: float) -> float:
    """
    Return 1.0 if value is within [low, high],
    decaying linearly to 0.0 as it moves away.
    """
    if value is None:
        return 0.5  # neutral when data missing
    if low <= value <= high:
        return 1.0
    span = high - low if high > low else 1.0
    if value < low:
        return max(0.0, 1.0 - (low - value) / span)
    return max(0.0, 1.0 - (value - high) / span)


def _nutrient_score(actual: Optional[float], required: float) -> float:
    """Score nutrient level: 1.0 when actual >= required, decays below."""
    if actual is None:
        return 0.5
    if required == 0:
        return 1.0
    ratio = actual / required
    if ratio >= 1.0:
        return 1.0
    return max(0.0, ratio)


# ── Sub-scores ───────────────────────────────────────────

def _soil_score(land: Dict[str, Any], crop: Dict[str, Any]) -> float:
    """Soil compatibility (soil type + pH + NPK)."""
    # Soil type match
    land_soil = (land.get("soil_type") or "").lower()
    crop_soils = [s.lower() for s in crop.get("soil_types", [])]
    soil_type_match = 1.0 if any(t in land_soil or land_soil in t for t in crop_soils) else 0.3

    # pH
    ph = _range_score(land.get("soil_ph"), crop.get("ph_min", 0), crop.get("ph_max", 14))

    # NPK
    n = _nutrient_score(land.get("nitrogen"), crop.get("nitrogen", 0))
    p = _nutrient_score(land.get("phosphorus"), crop.get("phosphorus", 0))
    k = _nutrient_score(land.get("potassium"), crop.get("potassium", 0))
    npk = (n + p + k) / 3.0

    return soil_type_match * 0.4 + ph * 0.3 + npk * 0.3


def _climate_score(land: Dict[str, Any], crop: Dict[str, Any]) -> float:
    """Climate compatibility (temperature + rainfall)."""
    temp = land.get("temperature")
    temp_score = _range_score(temp, crop.get("temp_min", 0), crop.get("temp_max", 50))

    rainfall = land.get("rainfall")
    rain_score = _range_score(rainfall, crop.get("rainfall_min", 0), crop.get("rainfall_max", 5000))

    return temp_score * 0.5 + rain_score * 0.5


def _resource_score(land: Dict[str, Any], crop: Dict[str, Any]) -> float:
    """Resource availability (irrigation, water match)."""
    has_irrigation = bool(land.get("irrigation_available", False))
    needs_irrigation = bool(crop.get("irrigation_required", False))

    if needs_irrigation and not has_irrigation:
        irrigation_fit = 0.3  # can still grow, but much harder
    elif not needs_irrigation and has_irrigation:
        irrigation_fit = 1.0  # bonus — surplus water
    else:
        irrigation_fit = 1.0

    # Water requirement vs rainfall
    rainfall = land.get("rainfall")
    water_req = crop.get("water_requirement", 0)
    if rainfall is not None and water_req > 0:
        water_ratio = min(rainfall / water_req, 1.5) / 1.5
    else:
        water_ratio = 0.5

    return irrigation_fit * 0.6 + water_ratio * 0.4


def _economic_score(crop: Dict[str, Any]) -> float:
    """Simple economic viability (revenue vs input cost)."""
    base_yield = crop.get("base_yield", 1)
    price = crop.get("base_price_per_ton", 0)
    cost = crop.get("input_cost_per_hectare", 1)
    revenue = base_yield * price
    if cost == 0:
        return 0.5
    ratio = revenue / cost
    # Clamp: ratio of 2 → 1.0, ratio of 0.5 → 0.25
    return min(1.0, ratio / 2.0)


def _ndvi_score(land: Dict[str, Any]) -> Optional[float]:
    """Vegetation health score from NDVI satellite data (0–1), or None."""
    current = land.get("current_ndvi")
    if current is None:
        return None

    vigor = land.get("vegetation_vigor", 0.5)
    trend = land.get("ndvi_trend", 0.0)
    healthy_pct = land.get("healthy_percentage", 50.0) / 100.0

    # Trend bonus/penalty (capped ±0.15)
    trend_factor = max(-0.15, min(0.15, trend * 5))

    score = current * 0.4 + vigor * 0.25 + healthy_pct * 0.25 + (0.5 + trend_factor) * 0.10
    return max(0.0, min(1.0, score))


# ── Public API ───────────────────────────────────────────

def calculate_suitability(land_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Score every crop against the given land/climate data.

    Parameters
    ----------
    land_data : dict
        Must include keys from the Land model plus optional climate keys:
        ``temperature`` (°C), ``rainfall`` (mm/year).

    Returns
    -------
    list[dict]
        Sorted descending by ``suitability_score``.  Each dict contains:
        ``name``, ``category``, ``suitability_score`` (0–100),
        ``predicted_yield``, ``estimated_profit``, ``confidence``,
        ``growth_duration``, and sub-score breakdown.
    """
    crops = _load_crop_db()
    results = []
    ndvi = _ndvi_score(land_data)
    has_ndvi = ndvi is not None

    for crop in crops:
        soil = _soil_score(land_data, crop)
        climate = _climate_score(land_data, crop)
        resource = _resource_score(land_data, crop)
        economic = _economic_score(crop)

        # Rebalance weights when NDVI data is available
        if has_ndvi:
            raw = (soil * 0.25 + climate * 0.30 + resource * 0.15
                   + economic * 0.10 + ndvi * 0.20)
        else:
            raw = soil * 0.30 + climate * 0.40 + resource * 0.20 + economic * 0.10

        score = round(raw * 100, 1)

        # Yield prediction: base yield adjusted by score
        base_yield = crop.get("base_yield", 0)
        predicted_yield = round(base_yield * (score / 100), 2)

        # Profit estimation per hectare
        price = crop.get("base_price_per_ton", 0)
        cost = crop.get("input_cost_per_hectare", 0)
        estimated_profit = round(predicted_yield * price - cost, 0)

        # Confidence: higher when more input data is available
        base_fields = ["soil_type", "soil_ph", "nitrogen", "phosphorus",
                       "potassium", "temperature", "rainfall", "irrigation_available"]
        ndvi_fields = ["current_ndvi", "ndvi_mean_12m", "vegetation_vigor"]
        all_fields = base_fields + (ndvi_fields if has_ndvi else [])
        provided = sum(1 for k in all_fields if land_data.get(k) is not None)
        confidence = round(min(1.0, provided / len(all_fields)), 2)

        breakdown = {
            "soil": round(soil * 100, 1),
            "climate": round(climate * 100, 1),
            "resource": round(resource * 100, 1),
            "economic": round(economic * 100, 1),
        }
        if has_ndvi:
            breakdown["ndvi"] = round(ndvi * 100, 1)

        results.append({
            "name": crop["name"],
            "category": crop.get("category", ""),
            "suitability_score": score,
            "predicted_yield": predicted_yield,
            "estimated_profit": estimated_profit,
            "confidence": confidence,
            "growth_duration": crop.get("growth_duration"),
            "breakdown": breakdown,
        })

    results.sort(key=lambda r: r["suitability_score"], reverse=True)
    return results


def simulate_scenario(
    land_data: Dict[str, Any],
    temp_change: float = 0.0,
    rainfall_change: float = 0.0,
) -> List[Dict[str, Any]]:
    """
    Re-run suitability analysis with adjusted climate parameters.
    """
    modified = dict(land_data)
    if modified.get("temperature") is not None:
        modified["temperature"] += temp_change
    if modified.get("rainfall") is not None:
        modified["rainfall"] += rainfall_change
    return calculate_suitability(modified)
