"""
Yield prediction module.

Loads the pre-trained Random Forest model and provides a ``YieldPredictor``
class for making predictions with confidence intervals.
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import numpy as np

_ML_DIR = Path(__file__).resolve().parent
_MODEL_DIR = _ML_DIR / "models"
_DATA_DIR = _ML_DIR / "data"


class YieldPredictor:
    """Predict crop yield (tons/ha) with confidence intervals."""

    def __init__(self):
        self._model = None
        self._soil_enc = None
        self._crop_enc = None
        self._feature_cols = None
        self._crop_db = None

    # ── Lazy loading ─────────────────────────────────────

    def _load(self):
        model_path = _MODEL_DIR / "yield_model.pkl"
        if not model_path.exists():
            raise FileNotFoundError(
                "Trained model not found. Run: python -m app.ml.train_yield_model"
            )
        self._model = joblib.load(model_path)
        self._soil_enc = joblib.load(_MODEL_DIR / "soil_encoder.pkl")
        self._crop_enc = joblib.load(_MODEL_DIR / "crop_encoder.pkl")
        self._feature_cols = joblib.load(_MODEL_DIR / "feature_cols.pkl")

        with open(_DATA_DIR / "crop_requirements.json") as f:
            self._crop_db = {c["name"]: c for c in json.load(f)}

    def _ensure_loaded(self):
        if self._model is None:
            self._load()

    # ── Feature preparation ──────────────────────────────

    def _encode_safe(self, encoder, value: str, fallback: int = 0) -> int:
        """Encode a label, returning fallback if unseen."""
        try:
            return int(encoder.transform([value])[0])
        except (ValueError, KeyError):
            return fallback

    def _prepare_features(self, land_data: Dict[str, Any], crop_name: str) -> np.ndarray:
        soil = (land_data.get("soil_type") or "loamy").lower()
        soil_encoded = self._encode_safe(self._soil_enc, soil)
        crop_encoded = self._encode_safe(self._crop_enc, crop_name)

        features = np.array([[
            soil_encoded,
            land_data.get("soil_ph", 6.5),
            land_data.get("nitrogen", 50),
            land_data.get("phosphorus", 30),
            land_data.get("potassium", 30),
            land_data.get("temperature", 25),
            land_data.get("rainfall", 800),
            int(bool(land_data.get("irrigation_available", False))),
            land_data.get("size", 1.0),
            land_data.get("elevation", 100),
            crop_encoded,
        ]])
        return features

    # ── Confidence via tree variance ─────────────────────

    def _tree_predictions(self, features: np.ndarray) -> np.ndarray:
        """Get individual predictions from each tree in the forest."""
        self._ensure_loaded()
        return np.array([tree.predict(features)[0] for tree in self._model.estimators_])

    # ── Public API ───────────────────────────────────────

    def predict(
        self,
        land_data: Dict[str, Any],
        crop_name: str,
    ) -> Dict[str, Any]:
        """
        Predict yield for a specific crop on the given land.

        Returns
        -------
        dict with keys:
            predicted_yield (tons/ha), min_yield, max_yield,
            confidence (0–1), crop_name.
        """
        self._ensure_loaded()
        features = self._prepare_features(land_data, crop_name)

        # Ensemble prediction
        tree_preds = self._tree_predictions(features)
        predicted = float(np.mean(tree_preds))
        std = float(np.std(tree_preds))

        # Clamp to non-negative
        predicted = max(0.0, round(predicted, 2))

        # Confidence: lower std relative to mean → higher confidence
        if predicted > 0:
            cv = std / predicted  # coefficient of variation
            confidence = round(max(0.0, min(1.0, 1.0 - cv)), 2)
        else:
            confidence = 0.5

        # Interval from tree spread (mean ± 1.5 std, clamped)
        min_yield = max(0.0, round(predicted - 1.5 * std, 2))
        max_yield = round(predicted + 1.5 * std, 2)

        return {
            "crop_name": crop_name,
            "predicted_yield": predicted,
            "min_yield": min_yield,
            "max_yield": max_yield,
            "confidence": confidence,
            "unit": "tons/ha",
        }

    def predict_all(
        self,
        land_data: Dict[str, Any],
        crop_names: Optional[list] = None,
    ) -> list:
        """Predict yield for multiple (or all known) crops."""
        self._ensure_loaded()
        if crop_names is None:
            crop_names = list(self._crop_db.keys())
        return [self.predict(land_data, name) for name in crop_names]


# Module-level singleton
yield_predictor = YieldPredictor()
