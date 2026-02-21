"""
Profit calculation and optimisation engine.

Estimates revenue, costs, profit, and ROI for each crop
based on predicted yield and the market/cost databases.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

_DATA_DIR = Path(__file__).resolve().parent / "data"

_MARKET_PRICES: Optional[Dict[str, Dict]] = None
_INPUT_COSTS: Optional[Dict[str, Dict]] = None


def _load_market_prices() -> Dict[str, Dict]:
    global _MARKET_PRICES
    if _MARKET_PRICES is None:
        with open(_DATA_DIR / "market_prices.json") as f:
            _MARKET_PRICES = json.load(f)
    return _MARKET_PRICES


def _load_input_costs() -> Dict[str, Dict]:
    global _INPUT_COSTS
    if _INPUT_COSTS is None:
        with open(_DATA_DIR / "input_costs.json") as f:
            _INPUT_COSTS = json.load(f)
    return _INPUT_COSTS


class ProfitCalculator:
    """Calculate profit, ROI, and per-acre metrics for a crop."""

    def __init__(self):
        self.market_prices = _load_market_prices()
        self.input_costs = _load_input_costs()

    # ── Cost helpers ─────────────────────────────────────

    def get_market_price(self, crop_name: str) -> Dict[str, Any]:
        """Return market price entry or sensible default."""
        return self.market_prices.get(crop_name, {
            "price_per_ton": 15000,
            "unit": "INR/ton",
            "volatility": "medium",
            "demand": "medium",
        })

    def get_input_cost(self, crop_name: str) -> Dict[str, Any]:
        """Return per-hectare cost breakdown or sensible default."""
        return self.input_costs.get(crop_name, {
            "seeds": 3000,
            "fertilizer": 6000,
            "pesticide": 3000,
            "irrigation": 5000,
            "labor": 7000,
            "misc": 3000,
        })

    def calculate_total_cost(self, crop_name: str, land_size: float) -> Dict[str, Any]:
        """
        Total cost = per-hectare cost × land_size.
        Returns breakdown + total.
        """
        cost_data = self.get_input_cost(crop_name)
        per_ha = {k: v for k, v in cost_data.items()}
        total_per_ha = sum(per_ha.values())
        total = round(total_per_ha * land_size, 2)
        return {
            "per_hectare": per_ha,
            "total_per_hectare": total_per_ha,
            "land_size": land_size,
            "total_cost": total,
        }

    # ── Main profit calculation ──────────────────────────

    def calculate_profit(
        self,
        crop_name: str,
        predicted_yield: float,
        land_size: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Calculate revenue, costs, profit, and ROI.

        Parameters
        ----------
        crop_name : str
        predicted_yield : float  — tons per hectare
        land_size : float  — hectares

        Returns
        -------
        dict with revenue, costs, profit, roi, profit_per_hectare, etc.
        """
        # Edge case: zero / negative yield
        if predicted_yield <= 0:
            cost_info = self.calculate_total_cost(crop_name, land_size)
            return {
                "crop_name": crop_name,
                "predicted_yield": predicted_yield,
                "land_size": land_size,
                "revenue": 0.0,
                "costs": cost_info,
                "profit": -cost_info["total_cost"],
                "roi": -100.0,
                "profit_per_hectare": -cost_info["total_per_hectare"],
                "market_info": self.get_market_price(crop_name),
            }

        market = self.get_market_price(crop_name)
        price_per_ton = market["price_per_ton"]

        revenue = round(predicted_yield * price_per_ton * land_size, 2)

        cost_info = self.calculate_total_cost(crop_name, land_size)
        total_cost = cost_info["total_cost"]

        profit = round(revenue - total_cost, 2)
        roi = round((profit / total_cost) * 100, 2) if total_cost > 0 else 0.0
        profit_per_ha = round(profit / land_size, 2) if land_size > 0 else 0.0

        return {
            "crop_name": crop_name,
            "predicted_yield": predicted_yield,
            "land_size": land_size,
            "revenue": revenue,
            "costs": cost_info,
            "profit": profit,
            "roi": roi,
            "profit_per_hectare": profit_per_ha,
            "market_info": market,
        }

    # ── Convenience wrappers (match test API) ─────────────

    def calculate(
        self,
        crop_name: str,
        predicted_yield: float,
        land_size: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Simplified wrapper returning a flat dict with
        revenue, total_cost, profit, roi.
        """
        full = self.calculate_profit(crop_name, predicted_yield, land_size)
        return {
            "crop_name": full["crop_name"],
            "predicted_yield": full["predicted_yield"],
            "land_size": full["land_size"],
            "revenue": full["revenue"],
            "total_cost": full["costs"]["total_cost"],
            "profit": full["profit"],
            "roi": full["roi"],
        }

    def batch_calculate(
        self,
        crops: List[Dict[str, Any]],
        land_size: float = 1.0,
    ) -> List[Dict[str, Any]]:
        """
        Calculate profit for a list of crops, sorted by profit descending.
        Each entry: {name, predicted_yield}.
        """
        results = []
        for entry in crops:
            name = entry.get("name") or entry.get("crop_name", "")
            yld = entry.get("predicted_yield", 0)
            results.append(self.calculate(name, yld, land_size))
        results.sort(key=lambda r: r["profit"], reverse=True)
        return results

    # ── Batch + ranking ──────────────────────────────────

    def rank_by_profitability(
        self,
        crops: List[Dict[str, Any]],
        land_size: float = 1.0,
    ) -> List[Dict[str, Any]]:
        """
        Given a list of dicts with ``name`` and ``predicted_yield``,
        return profit calculations sorted by profit descending.
        """
        results = []
        for entry in crops:
            name = entry.get("name") or entry.get("crop_name", "")
            yld = entry.get("predicted_yield", 0)
            result = self.calculate_profit(name, yld, land_size)
            result["suitability_score"] = entry.get("suitability_score")
            results.append(result)

        results.sort(key=lambda r: r["profit"], reverse=True)
        for rank, r in enumerate(results, 1):
            r["profit_rank"] = rank
        return results


# Module-level singleton
profit_calculator = ProfitCalculator()