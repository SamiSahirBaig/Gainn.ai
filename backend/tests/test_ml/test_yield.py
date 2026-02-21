"""Tests for yield prediction (can run without trained model)."""

import pytest


class TestYieldPredictor:
    def test_import(self):
        """YieldPredictor class should be importable."""
        from app.ml.yield_prediction import YieldPredictor
        assert YieldPredictor is not None

    def test_instantiation(self):
        """Creating instance should not raise."""
        from app.ml.yield_prediction import YieldPredictor
        predictor = YieldPredictor()
        assert predictor is not None

    @pytest.mark.slow
    def test_prediction_with_model(self):
        """Only runs if model is trained (pkl files exist)."""
        from pathlib import Path
        model_path = Path(__file__).resolve().parent.parent.parent / "app" / "ml" / "models" / "yield_model.pkl"
        if not model_path.exists():
            pytest.skip("Model not trained yet — run train_yield_model.py first")

        from app.ml.yield_prediction import YieldPredictor
        predictor = YieldPredictor()
        land_data = {
            "soil_type": "loamy",
            "soil_ph": 6.5,
            "nitrogen": 250,
            "phosphorus": 45,
            "potassium": 200,
            "temperature": 28,
            "rainfall": 1100,
            "irrigation_available": True,
        }
        result = predictor.predict(land_data, crop_name="Rice")
        assert "predicted_yield" in result
        assert "min_yield" in result
        assert "max_yield" in result
        assert result["predicted_yield"] > 0
        assert result["min_yield"] <= result["predicted_yield"]
        assert result["predicted_yield"] <= result["max_yield"]
