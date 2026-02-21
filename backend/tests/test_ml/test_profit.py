"""Tests for the profit calculator."""

from app.ml.profit_calculator import ProfitCalculator


class TestProfitCalculator:
    def setup_method(self):
        self.calc = ProfitCalculator()

    def test_instantiation(self):
        assert self.calc is not None
        assert len(self.calc.market_prices) > 0
        assert len(self.calc.input_costs) > 0

    def test_calculate_known_crop(self):
        result = self.calc.calculate("Rice", predicted_yield=5.0)
        assert "revenue" in result
        assert "total_cost" in result
        assert "profit" in result
        assert "roi" in result
        assert result["revenue"] > 0
        assert result["total_cost"] > 0

    def test_profit_is_revenue_minus_cost(self):
        result = self.calc.calculate("Rice", predicted_yield=5.0)
        expected = result["revenue"] - result["total_cost"]
        assert abs(result["profit"] - expected) < 1  # float tolerance

    def test_unknown_crop_returns_defaults(self):
        """Unknown crops get sensible default pricing, not zeros."""
        result = self.calc.calculate("UnknownCrop123", predicted_yield=5.0)
        assert result["revenue"] > 0  # default price applied
        assert "profit" in result

    def test_zero_yield(self):
        result = self.calc.calculate("Rice", predicted_yield=0)
        assert result["revenue"] == 0

    def test_batch_ranking(self):
        crops = [
            {"name": "Rice", "predicted_yield": 5.0},
            {"name": "Wheat", "predicted_yield": 4.0},
            {"name": "Cotton", "predicted_yield": 2.0},
        ]
        results = self.calc.batch_calculate(crops)
        assert len(results) == 3
        # Sorted by profit descending
        profits = [r["profit"] for r in results]
        assert profits == sorted(profits, reverse=True)

    def test_roi_calculation(self):
        result = self.calc.calculate("Rice", predicted_yield=5.0)
        if result["total_cost"] > 0:
            expected_roi = (result["profit"] / result["total_cost"]) * 100
            assert abs(result["roi"] - expected_roi) < 0.1
