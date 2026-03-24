"""
Market service — nearby market discovery, price enrichment, demand-supply analysis.
Uses curated APMC/mandi database with haversine distance calculation.
"""

import json
import math
import random
from pathlib import Path
from typing import Any, Dict, List, Optional


_DATA_DIR = Path(__file__).resolve().parent.parent / "ml" / "data"


def _load_json(filename: str) -> Any:
    with open(_DATA_DIR / filename) as f:
        return json.load(f)


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return distance in km between two lat/lng points."""
    R = 6371.0
    rlat1, rlng1 = math.radians(lat1), math.radians(lng1)
    rlat2, rlng2 = math.radians(lat2), math.radians(lng2)
    dlat = rlat2 - rlat1
    dlng = rlng2 - rlng1
    a = math.sin(dlat / 2) ** 2 + math.cos(rlat1) * math.cos(rlat2) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _estimated_travel_time(distance_km: float) -> int:
    """Rough travel time in minutes, assuming avg 40 km/h for rural + urban."""
    return max(5, round(distance_km / 40 * 60))


# ── Demand / Supply helpers ──────────────────────────────

_DEMAND_MAP = {
    "high": {"level": "high", "score": 0.85},
    "medium": {"level": "medium", "score": 0.55},
    "low": {"level": "low", "score": 0.30},
}

_SUPPLY_LEVELS = ["undersupply", "balanced", "oversupply"]


def _demand_supply_for_crop(crop_name: str, market: dict) -> Dict[str, Any]:
    """Generate demand-supply analysis for a crop at a specific market."""
    market_prices = _load_json("market_prices.json")
    crop_info = market_prices.get(crop_name, {})

    demand_level = crop_info.get("demand", "medium")
    demand = _DEMAND_MAP.get(demand_level, _DEMAND_MAP["medium"])

    # Simulate supply based on market type + crop availability
    is_primary_crop = crop_name in market.get("crops_traded", [])
    if is_primary_crop:
        supply_idx = min(2, max(0, hash(f"{market['id']}{crop_name}") % 3))
    else:
        supply_idx = 0  # undersupply if not a main crop
    supply_level = _SUPPLY_LEVELS[supply_idx]

    supply_scores = {"undersupply": 0.3, "balanced": 0.5, "oversupply": 0.8}
    ratio = round(demand["score"] / max(0.1, supply_scores[supply_level]), 2)

    return {
        "demand": demand_level,
        "demand_score": demand["score"],
        "supply": supply_level,
        "supply_score": supply_scores[supply_level],
        "ratio": ratio,
        "opportunity": ratio > 1.3,
    }


# ── Live data.gov.in integration ─────────────────────────

import os
import time
import logging

try:
    import requests as _requests
except ImportError:
    _requests = None

_AGMARKNET_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
_API_KEY = os.getenv("MARKET_DATA_API_KEY", "")

# Simple in-memory cache: {cache_key: (timestamp, data)}
_live_price_cache: Dict[str, Any] = {}
_CACHE_TTL = 3600  # 1 hour

logger = logging.getLogger(__name__)


def _fetch_live_prices(market_name: str, state: str) -> List[Dict[str, Any]]:
    """
    Fetch today's prices from data.gov.in AGMARKNET API.
    Returns list of {commodity, min_price, max_price, modal_price, variety, market}.
    Falls back gracefully on error.
    """
    if not _requests or not _API_KEY:
        return []

    cache_key = f"{state}:{market_name}"
    cached = _live_price_cache.get(cache_key)
    if cached and (time.time() - cached[0]) < _CACHE_TTL:
        return cached[1]

    try:
        resp = _requests.get(
            _AGMARKNET_URL,
            params={
                "api-key": _API_KEY,
                "format": "json",
                "limit": 50,
                "filters[state.keyword]": state,
            },
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()
        records = data.get("records", [])
        _live_price_cache[cache_key] = (time.time(), records)
        return records
    except Exception as exc:
        logger.debug("Live price fetch failed for %s: %s", market_name, exc)
        return []


# Our crop names → commodity names in AGMARKNET
_CROP_TO_COMMODITY = {
    "Rice": "Rice", "Wheat": "Wheat", "Maize": "Maize",
    "Cotton": "Cotton", "Sugarcane": "Sugarcane",
    "Potato": "Potato", "Tomato": "Tomato", "Onion": "Onion",
    "Cabbage": "Cabbage", "Soybean": "Soyabean",
    "Groundnut": "Groundnut", "Chickpea": "Bengal Gram(Gram)(Whole)",
    "Mango": "Mango(Raw-Ripe)", "Banana": "Banana",
    "Orange": "Orange", "Mustard": "Mustard",
    "Turmeric": "Turmeric", "Jute": "Jute",
    "Sunflower": "Sunflower", "Lentil": "Masoor Dal",
}


# ── Price helpers ────────────────────────────────────────

def _get_crop_price(crop_name: str, market: dict) -> Dict[str, Any]:
    """
    Get price for a crop at a market.
    Tries live data.gov.in API first, falls back to static prices.
    """
    # Try live prices first
    live_records = _fetch_live_prices(market.get("name", ""), market.get("state", ""))
    commodity_name = _CROP_TO_COMMODITY.get(crop_name, crop_name)

    live_match = None
    for rec in live_records:
        if commodity_name.lower() in rec.get("commodity", "").lower():
            live_match = rec
            break

    if live_match:
        modal_price_quintal = live_match.get("modal_price", 0)
        price_per_ton = round(modal_price_quintal * 10)  # quintal → ton
        min_price = round(live_match.get("min_price", 0) * 10)
        max_price = round(live_match.get("max_price", 0) * 10)

        # Determine trend from min/max spread
        spread = (max_price - min_price) / max(1, price_per_ton)
        if spread > 0.1:
            trend, trend_pct = "up", round(spread * 100, 1)
        elif spread < 0.03:
            trend, trend_pct = "stable", round(spread * 50, 1)
        else:
            trend, trend_pct = "down", round(-spread * 50, 1)

        return {
            "crop": crop_name,
            "price_per_ton": price_per_ton,
            "price_per_quintal": modal_price_quintal,
            "min_price_quintal": live_match.get("min_price", 0),
            "max_price_quintal": live_match.get("max_price", 0),
            "unit": "INR",
            "trend": trend,
            "trend_pct": trend_pct,
            "volatility": "medium",
            "demand": "high",
            "source": "AGMARKNET",
            "arrival_date": live_match.get("arrival_date", ""),
            "market_name": live_match.get("market", ""),
            "variety": live_match.get("variety", ""),
        }

    # Fallback to static prices
    market_prices = _load_json("market_prices.json")
    base = market_prices.get(crop_name, {})
    if not base:
        return {}

    multiplier = market.get("price_multiplier", 1.0)
    price = round(base["price_per_ton"] * multiplier)

    seed = hash(f"{market['id']}{crop_name}") % 100
    if seed < 35:
        trend, trend_pct = "up", round(2 + (seed % 12), 1)
    elif seed < 65:
        trend, trend_pct = "stable", round(-1 + (seed % 3), 1)
    else:
        trend, trend_pct = "down", round(-(2 + (seed % 8)), 1)

    return {
        "crop": crop_name,
        "price_per_ton": price,
        "price_per_quintal": round(price / 10),
        "unit": "INR",
        "trend": trend,
        "trend_pct": trend_pct,
        "volatility": base.get("volatility", "medium"),
        "demand": base.get("demand", "medium"),
        "source": "static",
    }



# ── Public API ──────────────────────────────────────────

def find_nearby_markets(
    lat: float, lng: float,
    radius_km: float = 50.0,
    crop_filter: Optional[str] = None,
    sort_by: str = "distance",
) -> List[Dict[str, Any]]:
    """
    Find markets within radius_km of (lat, lng).

    Parameters
    ----------
    sort_by : str
        'distance', 'best_price', or 'demand'
    crop_filter : str, optional
        Only include markets that trade this crop
    """
    markets_db = _load_json("nearby_markets.json")
    results = []

    for m in markets_db:
        dist = _haversine(lat, lng, m["lat"], m["lng"])
        if dist > radius_km:
            continue

        if crop_filter and crop_filter not in m.get("crops_traded", []):
            continue

        # Top 3 crops priced
        top_crops = m.get("crops_traded", [])[:5]
        prices = [_get_crop_price(c, m) for c in top_crops if _get_crop_price(c, m)]

        # Demand-supply for primary crops
        demand_supply = {}
        for c in top_crops[:3]:
            demand_supply[c] = _demand_supply_for_crop(c, m)

        # Overall demand score for sorting
        avg_demand = sum(
            ds.get("demand_score", 0.5) for ds in demand_supply.values()
        ) / max(1, len(demand_supply))

        results.append({
            "id": m["id"],
            "name": m["name"],
            "city": m["city"],
            "state": m["state"],
            "type": m["type"],
            "lat": m["lat"],
            "lng": m["lng"],
            "distance_km": round(dist, 1),
            "travel_time_min": _estimated_travel_time(dist),
            "operating_hours": m.get("operating_hours", ""),
            "contact": m.get("contact", ""),
            "rating": m.get("rating", 0),
            "crops_traded": m.get("crops_traded", []),
            "prices": prices,
            "demand_supply": demand_supply,
            "avg_demand_score": avg_demand,
        })

    # Sort
    if sort_by == "best_price":
        results.sort(key=lambda r: max((p.get("price_per_ton", 0) for p in r["prices"]), default=0), reverse=True)
    elif sort_by == "demand":
        results.sort(key=lambda r: r["avg_demand_score"], reverse=True)
    else:
        results.sort(key=lambda r: r["distance_km"])

    return results


def get_market_prices(market_id: str, crop_list: Optional[List[str]] = None) -> Dict[str, Any]:
    """Get full price data for a specific market."""
    markets_db = _load_json("nearby_markets.json")
    market = next((m for m in markets_db if m["id"] == market_id), None)
    if not market:
        return {"error": "Market not found"}

    crops = crop_list or market.get("crops_traded", [])
    prices = [_get_crop_price(c, market) for c in crops if _get_crop_price(c, market)]

    return {
        "market_id": market_id,
        "market_name": market["name"],
        "city": market["city"],
        "prices": prices,
        "last_updated": "2026-02-21",
    }


# Singleton-like access
market_service = type("MarketService", (), {
    "find_nearby": staticmethod(find_nearby_markets),
    "get_prices": staticmethod(get_market_prices),
    "demand_supply": staticmethod(_demand_supply_for_crop),
})()
