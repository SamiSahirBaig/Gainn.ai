"""
Application settings loaded from environment variables via pydantic-settings.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Project ──────────────────────────────────────────
    PROJECT_NAME: str = "Gainn.ai"
    PROJECT_DESCRIPTION: str = "Intelligent Agricultural Insights Platform"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # ── Database ─────────────────────────────────────────
    DATABASE_URL: str = "postgresql://gainnai:password@localhost:5432/gainnai"

    # ── Redis ────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── Authentication / JWT ─────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── CORS ─────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # ── Celery ───────────────────────────────────────────
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # ── External APIs ────────────────────────────────────
    WEATHER_API_KEY: str = ""
    MARKET_DATA_API_KEY: str = ""

    # ── Sentinel Hub (NDVI Satellite Imagery) ────────────
    SENTINEL_HUB_CLIENT_ID: str = ""
    SENTINEL_HUB_CLIENT_SECRET: str = ""

    # ── ML Models ────────────────────────────────────────
    MODEL_PATH: str = "./models"
    MODEL_VERSION: str = "1.0.0"

    # ── Logging ──────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


settings = Settings()
