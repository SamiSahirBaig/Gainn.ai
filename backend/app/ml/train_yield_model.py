"""
Generate synthetic training data and train a Random Forest yield-prediction model.

Usage (from backend/):
    source venv/bin/activate
    python -m app.ml.train_yield_model
"""

import json
import os
import random
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

_ML_DIR = Path(__file__).resolve().parent
_DATA_DIR = _ML_DIR / "data"
_MODEL_DIR = _ML_DIR / "models"

# ── Soil / crop label lists ─────────────────────────────
SOIL_TYPES = [
    "clay", "loamy", "sandy loam", "clay loam", "sandy",
    "silty clay", "red", "black", "alluvial",
]

with open(_DATA_DIR / "crop_requirements.json") as _f:
    _CROP_DB = json.load(_f)
CROP_NAMES = [c["name"] for c in _CROP_DB]
_CROP_LOOKUP = {c["name"]: c for c in _CROP_DB}


def _generate_synthetic_data(n: int = 1200) -> pd.DataFrame:
    """Create n synthetic training samples."""
    rows = []
    for _ in range(n):
        crop = random.choice(_CROP_DB)
        soil = random.choice(SOIL_TYPES)

        # Generate land features with some noise around crop ideals
        ph = round(random.uniform(4.0, 9.0), 1)
        nitrogen = round(random.uniform(10, 300), 1)
        phosphorus = round(random.uniform(5, 150), 1)
        potassium = round(random.uniform(5, 200), 1)
        temp = round(random.uniform(5, 45), 1)
        rainfall = round(random.uniform(100, 3000), 0)
        irrigation = random.choice([0, 1])
        size = round(random.uniform(0.5, 50), 1)
        elevation = round(random.uniform(0, 2000), 0)

        # Actual yield: base yield × suitability factor + noise
        base = crop["base_yield"]
        # Simple suitability proxy
        ph_fit = max(0, 1 - abs(ph - (crop["ph_min"] + crop["ph_max"]) / 2) / 4)
        temp_fit = max(0, 1 - abs(temp - (crop["temp_min"] + crop["temp_max"]) / 2) / 15)
        rain_fit = max(0, 1 - abs(rainfall - (crop["rainfall_min"] + crop["rainfall_max"]) / 2) / 1500)
        irr_bonus = 0.1 if irrigation and crop["irrigation_required"] else 0
        fit = (ph_fit * 0.25 + temp_fit * 0.35 + rain_fit * 0.25 + irr_bonus + 0.15) 
        noise = random.gauss(0, base * 0.08)
        actual_yield = max(0.0, round(base * fit + noise, 2))

        rows.append({
            "crop": crop["name"],
            "soil_type": soil,
            "soil_ph": ph,
            "nitrogen": nitrogen,
            "phosphorus": phosphorus,
            "potassium": potassium,
            "temperature": temp,
            "rainfall": rainfall,
            "irrigation": irrigation,
            "size": size,
            "elevation": elevation,
            "yield": actual_yield,
        })

    return pd.DataFrame(rows)


def train_and_save():
    """Train the model and persist to disk."""
    print("📊 Generating synthetic data …")
    df = _generate_synthetic_data(1200)

    # Encode categoricals
    soil_enc = LabelEncoder()
    crop_enc = LabelEncoder()
    df["soil_encoded"] = soil_enc.fit_transform(df["soil_type"])
    df["crop_encoded"] = crop_enc.fit_transform(df["crop"])

    feature_cols = [
        "soil_encoded", "soil_ph", "nitrogen", "phosphorus", "potassium",
        "temperature", "rainfall", "irrigation", "size", "elevation",
        "crop_encoded",
    ]
    X = df[feature_cols]
    y = df["yield"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42,
    )

    print("🌲 Training Random Forest …")
    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=12,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    mean_yield = y.mean()

    print(f"   R²   = {r2:.4f}")
    print(f"   RMSE = {rmse:.4f}  ({rmse/mean_yield*100:.1f}% of mean yield)")
    print(f"   MAE  = {mae:.4f}")

    # Save artefacts
    _MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump(model, _MODEL_DIR / "yield_model.pkl")
    joblib.dump(soil_enc, _MODEL_DIR / "soil_encoder.pkl")
    joblib.dump(crop_enc, _MODEL_DIR / "crop_encoder.pkl")
    joblib.dump(feature_cols, _MODEL_DIR / "feature_cols.pkl")
    print(f"✅ Model saved to {_MODEL_DIR}/yield_model.pkl")
    return {"r2": r2, "rmse": rmse, "mae": mae}


if __name__ == "__main__":
    train_and_save()
