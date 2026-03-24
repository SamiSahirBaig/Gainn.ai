"""
Weather service — enhanced weather data with forecast, farming recommendations,
and weather alerts. Uses OpenWeatherMap API with caching.
"""

import logging
import math
import os
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

try:
    import httpx
except ImportError:
    httpx = None

_OWM_KEY = os.getenv("OPENWEATHERMAP_API_KEY", "")
_CACHE: Dict[str, Any] = {}
_CACHE_TTL = 1800  # 30 minutes


# ── Weather condition mapping ────────────────────────────

_CONDITION_ICONS = {
    "clear sky": "☀️",
    "few clouds": "🌤️",
    "scattered clouds": "⛅",
    "broken clouds": "🌥️",
    "overcast clouds": "☁️",
    "light rain": "🌦️",
    "moderate rain": "🌧️",
    "heavy intensity rain": "🌧️",
    "thunderstorm": "⛈️",
    "snow": "🌨️",
    "mist": "🌫️",
    "haze": "🌫️",
    "fog": "🌫️",
    "drizzle": "🌦️",
    "light drizzle": "🌦️",
}

_WIND_DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
_DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def _wind_direction(deg: float) -> str:
    idx = round(deg / 45) % 8
    return _WIND_DIRECTIONS[idx]


def _get_icon(description: str) -> str:
    desc = description.lower()
    for key, icon in _CONDITION_ICONS.items():
        if key in desc:
            return icon
    if "rain" in desc:
        return "🌧️"
    if "cloud" in desc:
        return "☁️"
    if "sun" in desc or "clear" in desc:
        return "☀️"
    return "🌤️"


# ── Farming Recommendations ─────────────────────────────

def _generate_farming_tips(current: Dict, forecast_days: List) -> Dict[str, Any]:
    """Generate farmer-friendly recommendations based on weather."""
    temp = current.get("temp", 25)
    humidity = current.get("humidity", 50)
    wind = current.get("wind_speed", 0)
    rain_1h = current.get("rain_1h", 0)
    description = current.get("description", "").lower()

    tips = []
    alerts = []
    activity = "good"  # good, caution, avoid

    # Temperature-based
    if temp > 40:
        tips.append("🔥 Extreme heat! Irrigate crops early morning or late evening")
        alerts.append({"type": "heat_wave", "severity": "high", "message": "Heat wave conditions — protect crops with mulching"})
        activity = "avoid"
    elif temp > 35:
        tips.append("🌡️ Hot day — increase irrigation frequency, avoid midday fieldwork")
        activity = "caution"
    elif temp < 5:
        tips.append("❄️ Frost risk! Cover sensitive crops with cloth or straw")
        alerts.append({"type": "frost", "severity": "high", "message": "Frost warning — protect seedlings and young plants"})
        activity = "avoid"
    elif temp < 10:
        tips.append("🧊 Cold conditions — delay sowing of summer crops")
        activity = "caution"
    else:
        tips.append("✅ Good temperature for most farming activities")

    # Rain-based
    if rain_1h > 30 or "heavy rain" in description:
        tips.append("🌊 Heavy rain — postpone spraying, avoid waterlogged fields")
        alerts.append({"type": "heavy_rain", "severity": "high", "message": "Heavy rainfall expected — ensure drainage"})
        activity = "avoid"
    elif rain_1h > 5 or "rain" in description:
        tips.append("🌦️ Light rain — skip irrigation today, good for germination")
    elif humidity < 30:
        tips.append("💧 Low humidity — increase irrigation, best time early morning")

    # Wind-based
    if wind > 40:
        tips.append("⚠️ Strong winds — secure greenhouses, delay spraying")
        alerts.append({"type": "strong_wind", "severity": "medium", "message": f"Strong winds at {wind} km/h"})
        activity = "avoid"
    elif wind > 20:
        tips.append("💨 Moderate wind — avoid pesticide spraying")
        activity = "caution"

    # Humidity-based
    if humidity > 85:
        tips.append("🍄 High humidity — watch for fungal diseases, ensure ventilation")

    # Best days analysis from forecast
    best_days = []
    for day in forecast_days[:7]:
        d_temp = day.get("temp_max", 30)
        d_rain = day.get("rain", 0)
        d_wind = day.get("wind_speed", 0)
        if 15 < d_temp < 35 and d_rain < 5 and d_wind < 20:
            best_days.append(day.get("day_name", ""))

    # Irrigation recommendation
    if rain_1h > 2 or "rain" in description:
        irrigation = "Skip irrigation — rainfall is sufficient"
    elif humidity > 70 and temp < 30:
        irrigation = "Reduce irrigation — moderate humidity"
    elif temp > 35 or humidity < 40:
        irrigation = "Increase irrigation — hot/dry conditions"
    else:
        irrigation = "Normal irrigation schedule recommended"

    return {
        "tips": tips[:3],
        "alerts": alerts,
        "activity_level": activity,
        "irrigation": irrigation,
        "best_farming_days": best_days[:3],
    }


# ── API Fetchers ─────────────────────────────────────────

async def _fetch_current(lat: float, lon: float) -> Dict[str, Any]:
    """Fetch current weather from OpenWeatherMap."""
    cache_key = f"current:{lat:.2f}:{lon:.2f}"
    cached = _CACHE.get(cache_key)
    if cached and (time.time() - cached[0]) < _CACHE_TTL:
        return cached[1]

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"lat": lat, "lon": lon, "appid": _OWM_KEY, "units": "metric"}

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    main = data.get("main", {})
    wind = data.get("wind", {})
    weather = data.get("weather", [{}])[0]
    rain = data.get("rain", {})
    sys_data = data.get("sys", {})

    result = {
        "temp": round(main.get("temp", 25), 1),
        "feels_like": round(main.get("feels_like", 25), 1),
        "temp_min": round(main.get("temp_min", 20), 1),
        "temp_max": round(main.get("temp_max", 30), 1),
        "humidity": round(main.get("humidity", 50)),
        "pressure": main.get("pressure", 1013),
        "wind_speed": round(wind.get("speed", 0) * 3.6, 1),  # m/s → km/h
        "wind_direction": _wind_direction(wind.get("deg", 0)),
        "wind_deg": wind.get("deg", 0),
        "description": weather.get("description", "clear sky"),
        "icon": _get_icon(weather.get("description", "clear sky")),
        "main": weather.get("main", "Clear"),
        "rain_1h": rain.get("1h", 0),
        "rain_3h": rain.get("3h", 0),
        "visibility": round(data.get("visibility", 10000) / 1000, 1),  # meters → km
        "clouds": data.get("clouds", {}).get("all", 0),
        "sunrise": sys_data.get("sunrise"),
        "sunset": sys_data.get("sunset"),
        "location_name": data.get("name", ""),
        "country": sys_data.get("country", ""),
        "data_source": "openweathermap",
        "timestamp": int(time.time()),
    }

    _CACHE[cache_key] = (time.time(), result)
    return result


async def _fetch_forecast(lat: float, lon: float) -> List[Dict[str, Any]]:
    """Fetch 5-day/3-hour forecast from OpenWeatherMap free tier."""
    cache_key = f"forecast:{lat:.2f}:{lon:.2f}"
    cached = _CACHE.get(cache_key)
    if cached and (time.time() - cached[0]) < _CACHE_TTL:
        return cached[1]

    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {"lat": lat, "lon": lon, "appid": _OWM_KEY, "units": "metric"}

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    forecasts = data.get("list", [])

    # Group by day
    daily = {}
    hourly = []

    for entry in forecasts:
        dt = datetime.fromtimestamp(entry["dt"], tz=timezone.utc)
        day_key = dt.strftime("%Y-%m-%d")
        day_name = _DAY_NAMES[dt.weekday()]
        main = entry.get("main", {})
        weather = entry.get("weather", [{}])[0]
        rain = entry.get("rain", {}).get("3h", 0)
        wind = entry.get("wind", {})

        # Hourly (next 24h = first 8 entries)
        if len(hourly) < 8:
            hourly.append({
                "time": dt.strftime("%I %p"),
                "temp": round(main.get("temp", 25), 1),
                "icon": _get_icon(weather.get("description", "")),
                "description": weather.get("description", ""),
                "rain": round(rain, 1),
                "humidity": main.get("humidity", 50),
                "wind_speed": round(wind.get("speed", 0) * 3.6, 1),
            })

        # Daily aggregation
        if day_key not in daily:
            daily[day_key] = {
                "date": day_key,
                "day_name": day_name,
                "temp_min": 100,
                "temp_max": -100,
                "humidity_avg": [],
                "rain": 0,
                "wind_speed": 0,
                "descriptions": [],
                "icons": [],
            }

        d = daily[day_key]
        temp = main.get("temp", 25)
        d["temp_min"] = min(d["temp_min"], temp)
        d["temp_max"] = max(d["temp_max"], temp)
        d["humidity_avg"].append(main.get("humidity", 50))
        d["rain"] += rain
        d["wind_speed"] = max(d["wind_speed"], wind.get("speed", 0) * 3.6)
        d["descriptions"].append(weather.get("description", ""))
        d["icons"].append(_get_icon(weather.get("description", "")))

    # Finalize daily
    daily_list = []
    for day_key in sorted(daily.keys())[:7]:
        d = daily[day_key]
        # Pick most common icon/description
        most_common_icon = max(set(d["icons"]), key=d["icons"].count) if d["icons"] else "☀️"
        most_common_desc = max(set(d["descriptions"]), key=d["descriptions"].count) if d["descriptions"] else ""
        avg_hum = round(sum(d["humidity_avg"]) / max(1, len(d["humidity_avg"])))

        daily_list.append({
            "date": d["date"],
            "day_name": d["day_name"],
            "temp_min": round(d["temp_min"], 1),
            "temp_max": round(d["temp_max"], 1),
            "humidity": avg_hum,
            "rain": round(d["rain"], 1),
            "wind_speed": round(d["wind_speed"], 1),
            "icon": most_common_icon,
            "description": most_common_desc,
        })

    result = {"daily": daily_list, "hourly": hourly}
    _CACHE[cache_key] = (time.time(), result)
    return result


# ── Synthetic fallback ───────────────────────────────────

def _synthetic_weather(lat: float, lon: float) -> Dict[str, Any]:
    """Generate synthetic weather when API is unavailable."""
    now = datetime.now(timezone.utc)
    month = now.month

    base_temp = 30 - abs(lat - 15) * 0.4
    seasonal = 3 * math.sin(2 * math.pi * (month - 4) / 12)
    temp = round(max(5, min(45, base_temp + seasonal)), 1)
    humidity = round(50 + 20 * math.sin(2 * math.pi * (month - 7) / 12))

    is_monsoon = 6 <= month <= 9
    rain = round(5 + 10 * math.sin(2 * math.pi * (month - 7) / 12), 1) if is_monsoon else 0
    wind = round(5 + 3 * abs(math.sin(lat * 0.2)), 1)

    description = "monsoon showers" if is_monsoon and rain > 5 else "partly cloudy" if humidity > 60 else "clear sky"
    icon = _get_icon(description)

    current = {
        "temp": temp,
        "feels_like": round(temp + (humidity - 50) * 0.05, 1),
        "temp_min": round(temp - 3, 1),
        "temp_max": round(temp + 4, 1),
        "humidity": humidity,
        "pressure": 1013,
        "wind_speed": wind,
        "wind_direction": "SW" if is_monsoon else "NW",
        "wind_deg": 225 if is_monsoon else 315,
        "description": description,
        "icon": icon,
        "main": "Rain" if rain > 5 else "Clouds" if humidity > 60 else "Clear",
        "rain_1h": rain,
        "rain_3h": rain * 3,
        "visibility": 8.0 if rain > 5 else 10.0,
        "clouds": min(100, humidity + 10),
        "sunrise": None,
        "sunset": None,
        "location_name": "India",
        "country": "IN",
        "data_source": "synthetic",
        "timestamp": int(time.time()),
    }

    # Synthetic 5-day forecast
    daily = []
    hourly = []
    for i in range(5):
        dt = datetime.now(timezone.utc)
        day_offset = i
        d_temp = round(temp + math.sin(i * 0.8) * 3, 1)
        d_rain = round(max(0, rain + math.sin(i * 1.2) * 5), 1) if is_monsoon else 0
        daily.append({
            "date": f"Day {i + 1}",
            "day_name": _DAY_NAMES[(now.weekday() + i) % 7],
            "temp_min": round(d_temp - 3, 1),
            "temp_max": round(d_temp + 4, 1),
            "humidity": humidity,
            "rain": d_rain,
            "wind_speed": wind,
            "icon": _get_icon("rain" if d_rain > 5 else "partly cloudy"),
            "description": "showers" if d_rain > 5 else "partly cloudy",
        })

    for h in range(8):
        h_temp = round(temp + math.sin(h * 0.5) * 2, 1)
        hourly.append({
            "time": f"{(now.hour + h * 3) % 24}:00",
            "temp": h_temp,
            "icon": icon,
            "description": description,
            "rain": 0,
            "humidity": humidity,
            "wind_speed": wind,
        })

    forecast = {"daily": daily, "hourly": hourly}

    return current, forecast


# ── Public API ──────────────────────────────────────────

async def get_full_weather(lat: float, lon: float) -> Dict[str, Any]:
    """
    Get comprehensive weather data including current conditions,
    forecast, and farming recommendations.
    """
    if not httpx or not _OWM_KEY or _OWM_KEY == "your_openweathermap_api_key_here":
        current, forecast = _synthetic_weather(lat, lon)
        tips = _generate_farming_tips(current, forecast.get("daily", []))
        return {
            "current": current,
            "forecast": forecast,
            "farming": tips,
            "data_source": "synthetic",
        }

    try:
        current = await _fetch_current(lat, lon)
        forecast_data = await _fetch_forecast(lat, lon)
        tips = _generate_farming_tips(current, forecast_data.get("daily", []))
        return {
            "current": current,
            "forecast": forecast_data,
            "farming": tips,
            "data_source": "openweathermap",
        }
    except Exception as exc:
        logger.warning("Weather API failed: %s — using synthetic fallback", exc)
        current, forecast = _synthetic_weather(lat, lon)
        tips = _generate_farming_tips(current, forecast.get("daily", []))
        return {
            "current": current,
            "forecast": forecast,
            "farming": tips,
            "data_source": "synthetic",
        }
