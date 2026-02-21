"""
API v1 router aggregator.
Include individual endpoint routers here as they are created.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, land, analysis, markets, weather

api_router = APIRouter()

# ── Register endpoint routers ───────────────────────────
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(land.router, prefix="/lands", tags=["Lands"])
api_router.include_router(analysis.router, prefix="/analyses", tags=["Analyses"])
api_router.include_router(markets.router, prefix="/markets", tags=["Markets"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather"])


