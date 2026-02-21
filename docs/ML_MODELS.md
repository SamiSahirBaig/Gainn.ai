# ML Models Documentation

## Overview

Gainn.ai uses three ML components working in pipeline:

```
Land Data → Suitability Engine → Yield Predictor → Profit Calculator
                ↑
           NDVI Satellite Data
```

---

## 1. Crop Suitability Engine

**File**: `app/ml/suitability.py`
**Type**: Rule-based weighted scoring (not a trained model)

### Scoring Weights

| Factor | Without NDVI | With NDVI |
|--------|-------------|-----------|
| Soil compatibility | 30% | 25% |
| Climate compatibility | 40% | 30% |
| Resource availability | 20% | 15% |
| Economic viability | 10% | 10% |
| NDVI vegetation health | — | 20% |

### Sub-score Details

**Soil Score** — Evaluates:
- Soil type match (exact vs partial match with crop's preferred types)
- pH within optimal range (`ph_min` – `ph_max`)
- N, P, K nutrient levels vs crop requirements

**Climate Score** — Evaluates:
- Temperature within `temp_min` – `temp_max` range
- Rainfall within `rainfall_min` – `rainfall_max` range
- Penalties increase exponentially outside optimal ranges

**Resource Score** — Evaluates:
- Irrigation availability vs crop requirement
- Water source quality

**Economic Score** — Evaluates:
- Revenue/cost ratio (base_yield × price / input_cost)

**NDVI Score** — Evaluates (when satellite data available):
- Current NDVI value (40%)
- Vegetation vigor (25%)
- Healthy area percentage (25%)
- NDVI trend (10%)

### Data Source
- `app/ml/data/crop_requirements.json` — 20 crops with soil, climate, nutrient requirements

### Output
```python
{
    "name": "Rice",
    "suitability_score": 85.3,         # 0-100
    "predicted_yield": 4.26,            # tons/ha
    "estimated_profit": 42000.0,        # INR/ha
    "confidence": 0.88,                 # 0-1
    "breakdown": { "soil": 90, "climate": 82, "resource": 85, "economic": 78, "ndvi": 72 }
}
```

---

## 2. Yield Prediction Model

**File**: `app/ml/yield_prediction.py`
**Training**: `app/ml/train_yield_model.py`
**Type**: Random Forest Regressor (scikit-learn)

### Features

| Feature | Type | Source |
|---------|------|--------|
| soil_type | Categorical (encoded) | Land data |
| soil_ph | Float | Land data |
| nitrogen | Float | Land data |
| phosphorus | Float | Land data |
| potassium | Float | Land data |
| temperature | Float | Land/weather data |
| rainfall | Float | Land/weather data |
| irrigation_available | Boolean | Land data |
| crop_name | Categorical (encoded) | Crop selection |

### Training Process
1. Generates 1200 synthetic samples from `crop_requirements.json`
2. Adds Gaussian noise to simulate real-world variation
3. Label-encodes `soil_type` and `crop_name`
4. Trains `RandomForestRegressor(n_estimators=100, random_state=42)`
5. 80/20 train/test split

### Performance Targets
- **R²** > 0.75
- **RMSE** < 20% of mean yield
- **MAE** < 15% of mean yield

### Confidence Intervals
Derived from variance across individual decision trees:
```python
tree_predictions = [tree.predict(X) for tree in model.estimators_]
std_dev = np.std(tree_predictions)
confidence_interval = prediction ± 1.96 * std_dev  # 95% CI
```

### Model Artifacts
Saved in `app/ml/models/`:
- `yield_model.pkl` — Trained model
- `soil_encoder.pkl` — LabelEncoder for soil_type
- `crop_encoder.pkl` — LabelEncoder for crop_name
- `feature_cols.pkl` — Feature column order

### Retraining
```bash
cd backend
source venv/bin/activate
python -m app.ml.train_yield_model
```

---

## 3. Profit Calculator

**File**: `app/ml/profit_calculator.py`
**Type**: Deterministic calculation (not ML)

### Data Sources
- `app/ml/data/market_prices.json` — Price/ton, volatility, demand level
- `app/ml/data/input_costs.json` — Seeds, fertilizer, pesticide, irrigation, labor, misc

### Calculation
```
Revenue = predicted_yield × market_price_per_ton
Total Cost = seeds + fertilizer + pesticide + irrigation + labor + misc
Profit = Revenue - Total Cost
ROI = (Profit / Total Cost) × 100
Profit per Acre = Profit / 2.471  (1 hectare = 2.471 acres)
```

---

## 4. NDVI Service

**File**: `app/services/ndvi_service.py`
**Type**: Satellite data integration (Sentinel-2 via Sentinel Hub API)

### Features Extracted

| Feature | Description |
|---------|-------------|
| `current_ndvi` | Latest NDVI value (0-1) |
| `ndvi_mean_12m` | 12-month average |
| `ndvi_max_12m` | 12-month maximum |
| `ndvi_min_12m` | 12-month minimum |
| `ndvi_trend` | Linear regression slope |
| `ndvi_seasonality` | Ratio of std_dev to mean |
| `vegetation_vigor` | (current - min) / (max - min) |
| `healthy_percentage` | % of months with NDVI > 0.6 |

### Fallback Behavior
When Sentinel Hub is unavailable:
- Generates deterministic synthetic values based on latitude/longitude
- Tropical regions → higher base NDVI
- Includes seasonal patterns
- `data_source` field = `"estimated"` instead of `"sentinel-2"`

### Configuration
Set in `.env`:
```
SENTINEL_HUB_CLIENT_ID=<your-id>
SENTINEL_HUB_CLIENT_SECRET=<your-secret>
```
