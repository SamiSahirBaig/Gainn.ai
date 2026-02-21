"""
Market endpoints — nearby markets, prices, and price predictions.
"""

from typing import Optional

from fastapi import APIRouter, Query

from app.services.market_service import market_service
from app.services.market_data_service import get_live_prices, get_market_insights
from app.ml.price_predictor import price_predictor

router = APIRouter()


@router.get("/live-prices")
def live_prices():
    """Get live prices for top 15 crops with trends."""
    return get_live_prices()


@router.get("/insights")
def market_insights():
    """Get farmer-friendly market insights: hot/cold crops, opportunities."""
    return get_market_insights()


@router.get("/intelligence")
def market_intelligence(
    lat: float = Query(20.0, description="User latitude"),
    lng: float = Query(78.0, description="User longitude"),
):
    """Full market intelligence dashboard: top crops, demand analysis, best prices, best markets."""
    from app.ml.market_intelligence import get_intelligence_dashboard
    return get_intelligence_dashboard(lat, lng)



@router.get("/nearby")
def get_nearby_markets(
    lat: float = Query(..., description="Latitude of land"),
    lng: float = Query(..., description="Longitude of land"),
    radius: float = Query(50.0, description="Search radius in km"),
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    sort: str = Query("distance", description="Sort by: distance, best_price, demand"),
):
    """
    Find agricultural markets near a location.
    Returns markets sorted by distance, best price, or demand.
    """
    markets = market_service.find_nearby(lat, lng, radius, crop, sort)
    return {
        "lat": lat,
        "lng": lng,
        "radius_km": radius,
        "total": len(markets),
        "markets": markets,
    }



@router.get("/{market_id}/prices")
def get_market_prices(
    market_id: str,
    crops: Optional[str] = Query(None, description="Comma-separated crop names"),
):
    """
    Get current prices at a specific market.
    Optionally filter by crop names.
    """
    crop_list = [c.strip() for c in crops.split(",")] if crops else None
    return market_service.get_prices(market_id, crop_list)


@router.get("/price-predictions")
def get_price_predictions(
    crop: str = Query(..., description="Crop name"),
    timeframe: int = Query(6, description="Prediction timeframe in months (3, 6, or 12)"),
):
    """
    Get ML-predicted prices for a crop over the specified timeframe.
    Includes confidence intervals and best time to sell.
    """
    from datetime import datetime
    current_month = datetime.now().month
    return price_predictor.predict(crop, timeframe, current_month)
