"""
Market Intelligence — aggregates data from market_data_service and market_service
to produce actionable farmer-friendly recommendations.

SIMULATION FEATURE - BACKEND PRESERVED
Frontend removed for MVP simplification.
Backend kept for potential future reactivation.
"""

import logging
import math
import os
import time
from typing import Any, Dict, List

logger = logging.getLogger(__name__)

# Reuse existing services
from app.services.market_data_service import get_live_prices, CROP_META, _FALLBACK_PRICES
from app.services.market_service import market_service

_CACHE: Dict[str, Any] = {}
_CACHE_TTL = 600  # 10 minutes

# Profit per acre estimates (₹) — based on typical Indian yields
_PROFIT_PER_ACRE = {
    "Rice": 25000, "Wheat": 30000, "Maize": 18000, "Tomato": 45000,
    "Onion": 40000, "Potato": 22000, "Cotton": 35000, "Soyabean": 28000,
    "Soybean": 28000, "Groundnut": 32000, "Mustard": 26000, "Banana": 50000,
    "Turmeric": 55000, "Cabbage": 20000, "Lentil (Masoor)": 24000,
    "Lentil": 24000, "Sugarcane": 38000,
}

# Seasonal suitability (current month → suitable crops)
_SEASONAL = {
    "Kharif": ["Rice", "Maize", "Cotton", "Soybean", "Soyabean", "Groundnut", "Turmeric", "Sugarcane", "Banana"],
    "Rabi": ["Wheat", "Mustard", "Lentil", "Lentil (Masoor)", "Potato", "Onion", "Cabbage"],
    "All": ["Tomato", "Banana", "Sugarcane"],
}


def _current_season() -> str:
    """Determine current growing season from month."""
    import datetime
    month = datetime.datetime.now().month
    if 6 <= month <= 10:
        return "Kharif"
    elif 11 <= month <= 3:
        return "Rabi"
    return "Rabi"  # Feb is Rabi


def _is_in_season(crop_name: str) -> bool:
    season = _current_season()
    for s, crops in _SEASONAL.items():
        if s == season or s == "All":
            for c in crops:
                if c.lower() in crop_name.lower() or crop_name.lower() in c.lower():
                    return True
    return False


def get_intelligence_dashboard(lat: float = 20.0, lng: float = 78.0) -> Dict[str, Any]:
    """
    Get full market intelligence dashboard data.
    Returns top crops, high/low demand, best prices, best markets.
    """
    cache_key = f"intel:{lat:.1f}:{lng:.1f}"
    cached = _CACHE.get(cache_key)
    if cached and (time.time() - cached[0]) < _CACHE_TTL:
        return cached[1]

    # Get live price data
    price_data = get_live_prices()
    crops = price_data.get("crops", [])

    # ── Section 1: Top 5 Recommended ──
    scored = []
    for c in crops:
        demand_score = {"high": 3, "medium": 2, "low": 1}.get(c.get("demand", "medium"), 2)
        trend_score = 3 if c["trend"] == "up" else (2 if c["trend"] == "stable" else 1)
        profit = _PROFIT_PER_ACRE.get(c["name"], _PROFIT_PER_ACRE.get(c.get("commodity", ""), 20000))
        seasonal = 1.3 if _is_in_season(c["name"]) else 0.8

        opportunity_score = (demand_score * 0.35 + trend_score * 0.25 +
                             (profit / 60000) * 0.25 + seasonal * 0.15) * 100

        reasons = []
        if c["trend"] == "up":
            reasons.append("Prices are rising")
        if demand_score >= 3:
            reasons.append("High market demand")
        if _is_in_season(c["name"]):
            reasons.append(f"Best season to grow ({_current_season()})")
        if profit > 30000:
            reasons.append("Good profit potential")
        if not reasons:
            reasons.append("Stable market conditions")

        scored.append({
            **c,
            "profit_per_acre": profit,
            "opportunity_score": round(opportunity_score, 1),
            "reasons": reasons[:3],
            "in_season": _is_in_season(c["name"]),
        })

    scored.sort(key=lambda x: x["opportunity_score"], reverse=True)
    top_5 = scored[:5]

    # ── Section 2: High Demand ──
    high_demand = [
        {
            "name": c["name"], "icon": c["icon"], "price": c["price"],
            "unit": c.get("unit", "quintal"),
            "trend": c["trend"], "trend_label": c["trend_label"],
            "change_pct": c["change_pct"],
            "demand": c["demand"],
            "tag": "🔥 Hot" if c["trend"] == "up" else "📈 Steady",
            "tip": f"{c['name']} — sell now for best prices!" if c["trend"] == "up"
                else f"{c['name']} — demand is strong",
        }
        for c in scored if c.get("demand") in ("high",) and c["trend"] != "down"
    ][:6]

    # ── Section 3: Low Demand / Avoid ──
    low_demand = [
        {
            "name": c["name"], "icon": c["icon"], "price": c["price"],
            "unit": c.get("unit", "quintal"),
            "trend": c["trend"], "trend_label": c["trend_label"],
            "change_pct": c["change_pct"],
            "demand": c["demand"],
            "tag": "⚠️ Oversupply" if c["trend"] == "down" else "❄️ Low Demand",
            "reason": f"Prices falling — wait before selling" if c["trend"] == "down"
                else f"Low demand — consider alternative crops",
        }
        for c in scored if c.get("demand") == "low" or c["trend"] == "down"
    ][:5]

    # ── Section 4: Best Prices ──
    by_price = sorted(scored, key=lambda c: c["price"], reverse=True)
    best_prices = [
        {
            "name": c["name"], "icon": c["icon"], "price": c["price"],
            "unit": c.get("unit", "quintal"),
            "change_pct": c["change_pct"], "trend": c["trend"],
            "trend_label": c["trend_label"],
            "tip": "Price at peak — sell now!" if c["change_pct"] > 5
                else "Good price — consider selling" if c["change_pct"] > 0
                else "Stable price",
        }
        for c in by_price
    ][:5]

    # ── Section 5: Best Markets ──
    try:
        nearby = market_service.find_nearby(lat, lng, 200, None, "best_price")[:5]
    except Exception:
        nearby = []

    best_markets = [
        {
            "id": m.get("id", ""),
            "name": m.get("name", ""),
            "city": m.get("city", ""),
            "state": m.get("state", ""),
            "distance_km": round(m.get("distance_km", 0), 1),
            "travel_time": m.get("travel_time_min", ""),
            "crops": m.get("crops_traded", [])[:5],
            "rating": m.get("rating", 0),
            "type": m.get("type", "APMC"),
            "top_prices": m.get("top_prices", [])[:3],
        }
        for m in nearby
    ]

    result = {
        "top_recommended": top_5,
        "high_demand": high_demand,
        "low_demand": low_demand,
        "best_prices": best_prices,
        "best_markets": best_markets,
        "season": _current_season(),
        "data_source": price_data.get("data_source", "estimated"),
        "timestamp": int(time.time()),
    }

    _CACHE[cache_key] = (time.time(), result)
    return result
