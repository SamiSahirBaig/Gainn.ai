"""Tests for the crop suitability scoring engine."""

from app.ml.suitability import calculate_suitability


class TestCalculateSuitability:
    def test_returns_list(self, sample_land_data):
        results = calculate_suitability(sample_land_data)
        assert isinstance(results, list)
        assert len(results) > 0

    def test_sorted_by_score(self, sample_land_data):
        results = calculate_suitability(sample_land_data)
        scores = [r["suitability_score"] for r in results]
        assert scores == sorted(scores, reverse=True)

    def test_score_range(self, sample_land_data):
        results = calculate_suitability(sample_land_data)
        for r in results:
            assert 0 <= r["suitability_score"] <= 100
            assert 0 <= r["confidence"] <= 1

    def test_has_required_keys(self, sample_land_data):
        results = calculate_suitability(sample_land_data)
        for r in results:
            assert "name" in r
            assert "suitability_score" in r
            assert "predicted_yield" in r
            assert "estimated_profit" in r
            assert "breakdown" in r

    def test_breakdown_components(self, sample_land_data):
        results = calculate_suitability(sample_land_data)
        for r in results:
            bd = r["breakdown"]
            assert "soil" in bd
            assert "climate" in bd
            assert "resource" in bd
            assert "economic" in bd

    def test_with_ndvi_data(self, sample_land_data):
        data = {**sample_land_data, "current_ndvi": 0.7, "vegetation_vigor": 0.8, "healthy_percentage": 75}
        results = calculate_suitability(data)
        for r in results:
            assert "ndvi" in r["breakdown"]

    def test_without_ndvi_data(self, sample_land_data):
        results = calculate_suitability(sample_land_data)
        for r in results:
            assert "ndvi" not in r["breakdown"]

    def test_empty_input(self):
        results = calculate_suitability({})
        assert isinstance(results, list)
        assert len(results) > 0

    def test_partial_input(self):
        results = calculate_suitability({"soil_type": "clay", "temperature": 30})
        assert len(results) > 0
        for r in results:
            assert r["confidence"] < 1.0  # missing fields → lower confidence
