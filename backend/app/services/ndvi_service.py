"""
NDVI satellite imagery service using Sentinel Hub.

Fetches Sentinel-2 data, calculates NDVI statistics and time series,
and provides derived features for the ML models.

Falls back to synthetic estimates when the API is unavailable.
"""

import logging
import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Sentinel Hub integration (lazy import) ───────────────
_SH_AVAILABLE = False
_sh_config = None

try:
    from sentinelhub import (
        BBox,
        CRS,
        DataCollection,
        MimeType,
        SentinelHubRequest,
        SentinelHubStatistical,
        SHConfig,
        bbox_to_dimensions,
    )
    _SH_AVAILABLE = True
except ImportError:
    logger.warning("sentinelhub not installed – NDVI will use synthetic fallback")


def _get_sh_config() -> "SHConfig":
    """Lazily build Sentinel Hub config from app settings."""
    global _sh_config
    if _sh_config is None:
        _sh_config = SHConfig()
        _sh_config.sh_client_id = settings.SENTINEL_HUB_CLIENT_ID
        _sh_config.sh_client_secret = settings.SENTINEL_HUB_CLIENT_SECRET
    return _sh_config


# ── Geometry helpers ─────────────────────────────────────

def _point_to_bbox(lat: float, lon: float, buffer_m: int = 500) -> "BBox":
    """Create a ~buffer_m square around the point (approx degrees)."""
    d_lat = buffer_m / 111_320
    d_lon = buffer_m / (111_320 * math.cos(math.radians(lat)))
    coords = (lon - d_lon, lat - d_lat, lon + d_lon, lat + d_lat)
    return BBox(coords, crs=CRS.WGS84)


# ── Evalscript ───────────────────────────────────────────

_NDVI_EVALSCRIPT = """
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "SCL"], units: "DN" }],
    output: { bands: 1, sampleType: "FLOAT32" }
  };
}

function evaluatePixel(sample) {
  // Skip clouds / cloud shadows (SCL classes 3,8,9,10)
  if ([3,8,9,10].includes(sample.SCL)) return [-9999];
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04 + 0.0001);
  return [ndvi];
}
"""


# ── Core service ─────────────────────────────────────────

class NDVIService:
    """
    Fetch and process NDVI data from Sentinel-2 via Sentinel Hub.
    Gracefully degrades to synthetic values when credentials or
    the library are unavailable.
    """

    def __init__(self):
        self._available = (
            _SH_AVAILABLE
            and bool(settings.SENTINEL_HUB_CLIENT_ID)
            and bool(settings.SENTINEL_HUB_CLIENT_SECRET)
        )

    # ── Public methods ───────────────────────────────────

    def get_current_ndvi(
        self,
        latitude: float,
        longitude: float,
        buffer_meters: int = 500,
    ) -> Dict[str, Any]:
        """
        Current NDVI statistics for a location.

        Returns dict with mean_ndvi, max_ndvi, min_ndvi, std_ndvi,
        healthy_percentage, acquisition_date.
        """
        if not self._available:
            return self._synthetic_current(latitude, longitude)

        try:
            return self._fetch_current(latitude, longitude, buffer_meters)
        except Exception as exc:
            logger.error("Sentinel Hub current NDVI failed: %s", exc)
            return self._synthetic_current(latitude, longitude)

    def get_ndvi_time_series(
        self,
        latitude: float,
        longitude: float,
        months_back: int = 12,
    ) -> List[Dict[str, Any]]:
        """
        Monthly NDVI time series for the past ``months_back`` months.
        """
        if not self._available:
            return self._synthetic_time_series(latitude, months_back)

        try:
            return self._fetch_time_series(latitude, longitude, months_back)
        except Exception as exc:
            logger.error("Sentinel Hub time series failed: %s", exc)
            return self._synthetic_time_series(latitude, months_back)

    def calculate_ndvi_features(
        self,
        latitude: float,
        longitude: float,
    ) -> Dict[str, Any]:
        """
        Comprehensive NDVI features for ML models.

        - current_ndvi, ndvi_mean_12m, max, min, std
        - ndvi_trend (slope), ndvi_seasonality
        - vegetation_vigor, healthy_percentage
        """
        current = self.get_current_ndvi(latitude, longitude)
        series = self.get_ndvi_time_series(latitude, longitude, months_back=12)

        values = [s["mean_ndvi"] for s in series if s.get("mean_ndvi") is not None]

        ndvi_mean = float(np.mean(values)) if values else 0.5
        ndvi_max = float(np.max(values)) if values else 0.7
        ndvi_min = float(np.min(values)) if values else 0.2
        ndvi_std = float(np.std(values)) if values else 0.1

        trend = self._calculate_trend(values)
        seasonality = self._calculate_seasonality(values)
        vigor = min(1.0, ndvi_mean / 0.7)

        return {
            "current_ndvi": current.get("mean_ndvi", 0.5),
            "ndvi_mean_12m": round(ndvi_mean, 4),
            "ndvi_max_12m": round(ndvi_max, 4),
            "ndvi_min_12m": round(ndvi_min, 4),
            "ndvi_std_12m": round(ndvi_std, 4),
            "ndvi_trend": round(trend, 4),
            "ndvi_seasonality": round(seasonality, 4),
            "vegetation_vigor": round(vigor, 4),
            "healthy_percentage": current.get("healthy_percentage", 50.0),
            "data_source": "sentinel-2" if self._available else "synthetic",
        }

    # ── Sentinel Hub fetch ───────────────────────────────

    def _fetch_current(
        self, lat: float, lon: float, buffer_m: int,
    ) -> Dict[str, Any]:
        bbox = _point_to_bbox(lat, lon, buffer_m)
        size = bbox_to_dimensions(bbox, resolution=20)

        end = datetime.now(timezone.utc)
        start = end - timedelta(days=30)

        request = SentinelHubRequest(
            evalscript=_NDVI_EVALSCRIPT,
            input_data=[
                SentinelHubRequest.input_data(
                    data_collection=DataCollection.SENTINEL2_L2A,
                    time_interval=(start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")),
                    mosaicking_order="leastCC",
                ),
            ],
            responses=[
                SentinelHubRequest.output_response("default", MimeType.TIFF),
            ],
            bbox=bbox,
            size=size,
            config=_get_sh_config(),
        )

        data = request.get_data()[0]  # numpy array
        valid = data[data > -9000]  # mask no-data

        if valid.size == 0:
            return self._synthetic_current(lat, lon)

        mean_val = float(np.mean(valid))
        healthy_pct = float(np.sum(valid > 0.6) / valid.size * 100)

        return {
            "mean_ndvi": round(mean_val, 4),
            "max_ndvi": round(float(np.max(valid)), 4),
            "min_ndvi": round(float(np.min(valid)), 4),
            "std_ndvi": round(float(np.std(valid)), 4),
            "healthy_percentage": round(healthy_pct, 1),
            "acquisition_date": end.strftime("%Y-%m-%d"),
        }

    def _fetch_time_series(
        self, lat: float, lon: float, months_back: int,
    ) -> List[Dict[str, Any]]:
        bbox = _point_to_bbox(lat, lon, 500)
        size = bbox_to_dimensions(bbox, resolution=20)
        results: List[Dict[str, Any]] = []

        now = datetime.now(timezone.utc)
        for i in range(months_back, 0, -1):
            month_end = now - timedelta(days=30 * (i - 1))
            month_start = now - timedelta(days=30 * i)

            try:
                request = SentinelHubRequest(
                    evalscript=_NDVI_EVALSCRIPT,
                    input_data=[
                        SentinelHubRequest.input_data(
                            data_collection=DataCollection.SENTINEL2_L2A,
                            time_interval=(
                                month_start.strftime("%Y-%m-%d"),
                                month_end.strftime("%Y-%m-%d"),
                            ),
                            mosaicking_order="leastCC",
                        ),
                    ],
                    responses=[
                        SentinelHubRequest.output_response("default", MimeType.TIFF),
                    ],
                    bbox=bbox,
                    size=size,
                    config=_get_sh_config(),
                )
                data = request.get_data()[0]
                valid = data[data > -9000]
                mean_val = float(np.mean(valid)) if valid.size > 0 else None
            except Exception:
                mean_val = None

            results.append({
                "date": month_start.strftime("%Y-%m"),
                "mean_ndvi": round(mean_val, 4) if mean_val is not None else None,
            })

        return results

    # ── Synthetic fallback ───────────────────────────────

    @staticmethod
    def _synthetic_current(lat: float, lon: float) -> Dict[str, Any]:
        """Deterministic synthetic NDVI based on lat/lon."""
        # Tropical regions → higher base NDVI
        base = 0.55 + 0.15 * math.exp(-((abs(lat) - 20) ** 2) / 400)
        noise = 0.05 * math.sin(lat * 17.3 + lon * 7.7)
        mean_ndvi = round(max(0.1, min(0.9, base + noise)), 4)
        return {
            "mean_ndvi": mean_ndvi,
            "max_ndvi": round(min(0.95, mean_ndvi + 0.15), 4),
            "min_ndvi": round(max(0.05, mean_ndvi - 0.20), 4),
            "std_ndvi": 0.08,
            "healthy_percentage": round(mean_ndvi * 80, 1),
            "acquisition_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        }

    @staticmethod
    def _synthetic_time_series(lat: float, months: int) -> List[Dict[str, Any]]:
        """Generate a plausible seasonal NDVI curve."""
        now = datetime.now(timezone.utc)
        base = 0.50 + 0.10 * math.exp(-((abs(lat) - 20) ** 2) / 400)
        results = []
        for i in range(months, 0, -1):
            dt = now - timedelta(days=30 * i)
            # Simple seasonal pattern
            seasonal = 0.12 * math.sin(2 * math.pi * (dt.month - 3) / 12)
            val = round(max(0.1, min(0.9, base + seasonal)), 4)
            results.append({"date": dt.strftime("%Y-%m"), "mean_ndvi": val})
        return results

    # ── Derived features ─────────────────────────────────

    @staticmethod
    def _calculate_trend(values: List[float]) -> float:
        """Simple linear regression slope over the time series."""
        if len(values) < 3:
            return 0.0
        n = len(values)
        x = np.arange(n, dtype=float)
        y = np.array(values, dtype=float)
        slope = float((n * np.sum(x * y) - np.sum(x) * np.sum(y)) /
                       (n * np.sum(x ** 2) - np.sum(x) ** 2 + 1e-9))
        return slope

    @staticmethod
    def _calculate_seasonality(values: List[float]) -> float:
        """Seasonality index: range / mean."""
        if not values:
            return 0.0
        arr = np.array(values)
        mean = np.mean(arr)
        if mean == 0:
            return 0.0
        return float((np.max(arr) - np.min(arr)) / mean)


# Module-level singleton
ndvi_service = NDVIService()
