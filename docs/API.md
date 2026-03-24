# Gainn.ai API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication

All protected endpoints require a **Bearer JWT token** in the `Authorization` header.

### Login
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=farmer@gainn.ai&password=Farmer@123
```

**Response** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer"
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Secure@123",
  "full_name": "New User"
}
```

**Response** `201 Created`
```json
{
  "data": { "id": 4, "email": "user@example.com", "full_name": "New User" }
}
```

### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## Lands

### Create Land
```http
POST /lands/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Farm Plot A",
  "latitude": 17.385,
  "longitude": 78.4867,
  "size": 5.0,
  "soil_type": "loamy",
  "soil_ph": 6.5,
  "nitrogen": 250,
  "phosphorus": 45,
  "potassium": 200,
  "irrigation_available": true,
  "water_source": "well"
}
```

**Response** `201 Created`
```json
{
  "data": {
    "id": 1,
    "name": "Farm Plot A",
    "latitude": 17.385,
    "longitude": 78.4867,
    "size": 5.0,
    "soil_type": "loamy",
    "soil_ph": 6.5,
    ...
  }
}
```

### List Lands
```http
GET /lands/
Authorization: Bearer <token>
```

### Get Land by ID
```http
GET /lands/{land_id}
Authorization: Bearer <token>
```

---

## Analyses

### Create Analysis
Runs the ML suitability engine + NDVI pipeline on a land parcel.

```http
POST /analyses/
Authorization: Bearer <token>
Content-Type: application/json

{
  "land_id": 1,
  "soil_type": "loamy",
  "soil_ph": 6.5,
  "nitrogen": 250,
  "phosphorus": 45,
  "potassium": 200,
  "temperature": 28,
  "rainfall": 1100,
  "irrigation_available": true,
  "latitude": 17.385,
  "longitude": 78.4867
}
```

**Response** `201 Created`
```json
{
  "data": {
    "id": 1,
    "status": "completed",
    "results": {
      "top_recommendations": [
        {
          "name": "Rice",
          "suitability_score": 85.3,
          "predicted_yield": 4.26,
          "estimated_profit": 42000,
          "confidence": 0.88,
          "breakdown": { "soil": 90.0, "climate": 82.5, "resource": 85.0, "economic": 78.0, "ndvi": 72.0 }
        }
      ],
      "ndvi_data": { "current_ndvi": 0.65, "ndvi_trend": 0.02, "data_source": "sentinel-2" }
    }
  }
}
```

### List Analyses
```http
GET /analyses/
Authorization: Bearer <token>
```

### Get Analysis
```http
GET /analyses/{analysis_id}
Authorization: Bearer <token>
```

### Get Recommendations
```http
GET /analyses/{analysis_id}/recommendations
Authorization: Bearer <token>
```

Returns the top crop recommendations sorted by suitability score.

### Get NDVI Data
```http
GET /analyses/{analysis_id}/ndvi
Authorization: Bearer <token>
```

**Response** `200 OK`
```json
{
  "current_ndvi": 0.65,
  "ndvi_mean_12m": 0.58,
  "ndvi_max_12m": 0.78,
  "ndvi_min_12m": 0.32,
  "ndvi_trend": 0.02,
  "vegetation_vigor": 0.72,
  "healthy_percentage": 68.5,
  "data_source": "sentinel-2",
  "time_series": [
    { "date": "2025-03", "mean_ndvi": 0.45 },
    { "date": "2025-04", "mean_ndvi": 0.52 }
  ]
}
```

### Run Simulation
```http
POST /analyses/{analysis_id}/simulate
Authorization: Bearer <token>
Content-Type: application/json

{
  "temp_change": 2.0,
  "rainfall_change": -20.0
}
```

**Response** `200 OK`
```json
{
  "original_recommendations": [...],
  "simulated_recommendations": [...],
  "scenario": { "temp_change": 2.0, "rainfall_change": -20.0 }
}
```

---

## Health Check

```http
GET /health
```

**Response** `200 OK`
```json
{ "status": "healthy", "version": "1.0.0" }
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 400  | Bad Request — invalid input data |
| 401  | Unauthorized — missing or invalid token |
| 403  | Forbidden — insufficient permissions |
| 404  | Not Found — resource doesn't exist |
| 422  | Validation Error — schema mismatch |
| 500  | Internal Server Error |

**Error Response Format**
```json
{
  "detail": "Error description here"
}
```
