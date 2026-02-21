"""
Price predictor — lightweight seasonal price forecasting with confidence intervals.
Uses historical patterns + volatility to generate 3/6/12-month price predictions.
"""

import json
import math
from pathlib import Path
from typing import Any, Dict, List, Optional

_DATA_DIR = Path(__file__).resolve().parent / "data"

# Seasonal multipliers per month (index 0 = Jan).
# Crops like Wheat peak around harvest (Apr), Rice around Oct-Nov, etc.
_SEASONAL_PATTERNS = {
    "Rice":       [1.02, 1.04, 1.06, 1.08, 1.10, 1.05, 0.98, 0.95, 0.93, 0.90, 0.92, 0.97],
    "Wheat":      [0.95, 0.97, 1.00, 1.08, 1.10, 1.06, 1.02, 0.98, 0.95, 0.93, 0.92, 0.94],
    "Maize":      [1.00, 0.98, 0.96, 0.95, 0.97, 1.00, 1.02, 1.04, 1.06, 1.08, 1.05, 1.02],
    "Cotton":     [0.95, 0.93, 0.95, 0.98, 1.00, 1.02, 1.04, 1.06, 1.08, 1.10, 1.05, 0.98],
    "Sugarcane":  [1.02, 1.04, 1.05, 1.03, 1.00, 0.98, 0.97, 0.96, 0.98, 1.00, 1.02, 1.03],
    "Potato":     [0.90, 0.88, 0.92, 0.98, 1.05, 1.10, 1.12, 1.08, 1.02, 0.98, 0.95, 0.92],
    "Tomato":     [0.85, 0.88, 0.95, 1.05, 1.15, 1.20, 1.10, 1.00, 0.90, 0.85, 0.82, 0.85],
    "Onion":      [0.90, 0.88, 0.92, 1.00, 1.08, 1.12, 1.15, 1.10, 1.05, 0.95, 0.90, 0.88],
    "Soybean":    [0.98, 1.00, 1.02, 1.04, 1.02, 1.00, 0.96, 0.94, 0.96, 1.00, 1.04, 1.02],
    "Groundnut":  [0.97, 0.98, 1.00, 1.02, 1.04, 1.03, 1.00, 0.98, 0.96, 0.98, 1.02, 1.00],
    "Chickpea":   [0.95, 0.97, 1.02, 1.08, 1.10, 1.06, 1.02, 0.98, 0.95, 0.93, 0.94, 0.95],
    "Mango":      [0.80, 0.85, 0.95, 1.10, 1.20, 1.15, 1.05, 0.90, 0.82, 0.78, 0.75, 0.78],
    "Banana":     [1.00, 1.00, 1.02, 1.03, 1.02, 1.00, 0.98, 0.97, 0.98, 1.00, 1.02, 1.01],
    "Orange":     [1.05, 1.08, 1.05, 1.00, 0.95, 0.92, 0.90, 0.92, 0.95, 1.00, 1.05, 1.08],
    "Mustard":    [0.95, 0.98, 1.05, 1.10, 1.08, 1.02, 0.98, 0.95, 0.93, 0.92, 0.94, 0.95],
    "Turmeric":   [1.00, 1.02, 1.05, 1.08, 1.06, 1.02, 0.98, 0.95, 0.93, 0.95, 0.98, 1.00],
    "Jute":       [0.95, 0.93, 0.95, 0.98, 1.00, 1.02, 1.08, 1.12, 1.10, 1.05, 1.00, 0.97],
    "Sunflower":  [0.98, 1.00, 1.02, 1.04, 1.03, 1.00, 0.97, 0.95, 0.96, 0.98, 1.00, 1.00],
    "Lentil":     [0.95, 0.97, 1.02, 1.08, 1.10, 1.06, 1.00, 0.96, 0.94, 0.93, 0.94, 0.95],
    "Cabbage":    [0.92, 0.90, 0.95, 1.02, 1.08, 1.12, 1.10, 1.05, 0.98, 0.95, 0.93, 0.92],
}

_VOLATILITY_SPREAD = {"low": 0.04, "medium": 0.08, "high": 0.15}

_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def predict_prices(
    crop_name: str,
    timeframe_months: int = 6,
    current_month: int = 2,  # 1-indexed (Feb = 2)
) -> Dict[str, Any]:
    """
    Predict future prices for a crop over the given timeframe.

    Returns monthly predictions with confidence intervals.
    """
    with open(_DATA_DIR / "market_prices.json") as f:
        market_prices = json.load(f)

    crop_data = market_prices.get(crop_name)
    if not crop_data:
        return {"error": f"No price data for {crop_name}"}

    base_price = crop_data["price_per_ton"]
    volatility = crop_data.get("volatility", "medium")
    spread = _VOLATILITY_SPREAD.get(volatility, 0.08)

    seasonal = _SEASONAL_PATTERNS.get(crop_name, [1.0] * 12)

    predictions = []
    best_month = None
    best_price = 0

    # Slight upward trend (2-5% annually)
    annual_trend = 0.03

    for i in range(timeframe_months):
        month_idx = (current_month - 1 + i) % 12  # 0-indexed
        month_name = _MONTH_NAMES[month_idx]

        # Apply seasonal factor + trend
        trend_factor = 1 + (annual_trend * (i / 12))
        seasonal_factor = seasonal[month_idx]
        predicted = round(base_price * seasonal_factor * trend_factor)

        # Confidence narrows for near-term, widens for far-term
        time_uncertainty = 1 + (i * 0.02)
        margin = round(predicted * spread * time_uncertainty)

        confidence = max(0.5, round(0.92 - (i * 0.04), 2))

        entry = {
            "month": month_name,
            "month_index": month_idx + 1,
            "predicted_price": predicted,
            "min_price": predicted - margin,
            "max_price": predicted + margin,
            "confidence": confidence,
            "seasonal_factor": round(seasonal_factor, 3),
        }
        predictions.append(entry)

        if predicted > best_price:
            best_price = predicted
            best_month = entry

    # Overall trend
    first_price = predictions[0]["predicted_price"]
    last_price = predictions[-1]["predicted_price"]
    overall_trend = "up" if last_price > first_price * 1.02 else "down" if last_price < first_price * 0.98 else "stable"
    trend_pct = round(((last_price - first_price) / first_price) * 100, 1)

    return {
        "crop": crop_name,
        "current_price": base_price,
        "volatility": volatility,
        "timeframe_months": timeframe_months,
        "predictions": predictions,
        "best_time_to_sell": {
            "month": best_month["month"] if best_month else None,
            "predicted_price": best_price,
            "reason": f"Seasonal peak — prices typically highest in {best_month['month']}" if best_month else None,
        },
        "overall_trend": overall_trend,
        "trend_pct": trend_pct,
        "seasonal_pattern": [
            {"month": _MONTH_NAMES[i], "factor": round(seasonal[i], 3)}
            for i in range(12)
        ] if crop_name in _SEASONAL_PATTERNS else None,
    }


# Convenience singleton
price_predictor = type("PricePredictor", (), {
    "predict": staticmethod(predict_prices),
})()
