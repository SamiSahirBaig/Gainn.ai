# RootAura - System Architecture

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** MVP Design Phase

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Technology Stack](#technology-stack)
4. [Data Architecture](#data-architecture)
5. [API Design](#api-design)
6. [ML Pipeline](#ml-pipeline)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Scalability Strategy](#scalability-strategy)

---

## 1. Architecture Overview

RootAura follows a **modern full-stack architecture** with React frontend and Python backend:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile App  │  │     PWA      │          │
│  │  (React.js)  │  │(React Native)│  │   (React)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Gateway (FastAPI / Python)                          │  │
│  │  - Authentication & Authorization                        │  │
│  │  - Rate Limiting                                         │  │
│  │  - Request Routing                                       │  │
│  │  - Load Balancing                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Land      │  │    Yield     │  │   Market     │          │
│  │   Analysis   │  │  Prediction  │  │ Intelligence │          │
│  │   Service    │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Social     │  │   Resource   │  │     User     │          │
│  │ Intelligence │  │  Scheduling  │  │  Management  │          │
│  │   Service    │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    ML/AI PROCESSING LAYER                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ML Pipeline (Python / TensorFlow / Scikit-learn)       │  │
│  │  - Yield Prediction Models                              │  │
│  │  - Price Forecasting Models                             │  │
│  │  - Crop Recommendation Engine                           │  │
│  │  - Pattern Recognition (Social Intelligence)            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │   MongoDB    │  │    Redis     │          │
│  │ (Relational) │  │  (NoSQL)     │  │   (Cache)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   S3/Blob    │  │   Celery     │  │  Elasticsearch│         │
│  │  (Storage)   │  │ (Task Queue) │  │   (Search)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Weather API │  │  Market Data │  │   Soil DB    │          │
│  │(OpenWeather) │  │     API      │  │     API      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. System Components

### 2.1 Frontend Components (React)

#### Web Application (React + Vite)
```
frontend/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── FarmOverview.jsx
│   │   │   ├── CropRecommendations.jsx
│   │   │   └── ProfitAnalysis.jsx
│   │   ├── LandAnalysis/
│   │   │   ├── LandInput.jsx
│   │   │   ├── SuitabilityMap.jsx
│   │   │   └── SoilReport.jsx
│   │   ├── YieldPrediction/
│   │   │   ├── CropSelector.jsx
│   │   │   ├── YieldChart.jsx
│   │   │   └── ScenarioSimulator.jsx
│   │   ├── MarketIntelligence/
│   │   │   ├── PriceChart.jsx
│   │   │   ├── MarketAlerts.jsx
│   │   │   └── SellingStrategy.jsx
│   │   ├── ResourceSchedule/
│   │   │   ├── Calendar.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── Notifications.jsx
│   │   └── common/
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       ├── Sidebar.jsx
│   │       └── Loading.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── LandAnalysis.jsx
│   │   ├── CropRecommendation.jsx
│   │   ├── MarketIntelligence.jsx
│   │   └── Profile.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── landService.js
│   │   ├── cropService.js
│   │   └── marketService.js
│   ├── store/
│   │   ├── index.js
│   │   ├── slices/
│   │   │   ├── userSlice.js
│   │   │   ├── landSlice.js
│   │   │   └── recommendationSlice.js
│   │   └── middleware/
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useLand.js
│   │   └── useRecommendations.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── styles/
│   │   ├── global.css
│   │   └── tailwind.css
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

**Key Technologies:**
- **Framework:** React 18
- **Build Tool:** Vite
- **State Management:** Redux Toolkit / Zustand
- **UI Library:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts / Chart.js
- **Maps:** Leaflet / React-Leaflet
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Routing:** React Router v6

---

### 2.2 Backend Components (Python/FastAPI)

#### API Server (FastAPI)
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry
│   ├── config.py                  # Configuration settings
│   ├── dependencies.py            # Dependency injection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── lands.py
│   │   │   │   ├── crops.py
│   │   │   │   ├── recommendations.py
│   │   │   │   ├── predictions.py
│   │   │   │   ├── market.py
│   │   │   │   └── social.py
│   │   │   └── api.py             # API router
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py            # JWT, password hashing
│   │   ├── config.py              # Core configuration
│   │   └── database.py            # Database connection
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # SQLAlchemy models
│   │   ├── land.py
│   │   ├── crop.py
│   │   ├── recommendation.py
│   │   └── market.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py                # Pydantic schemas
│   │   ├── land.py
│   │   ├── crop.py
│   │   ├── recommendation.py
│   │   └── market.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── land_analysis.py
│   │   ├── yield_prediction.py
│   │   ├── market_intelligence.py
│   │   ├── social_intelligence.py
│   │   ├── resource_schedule.py
│   │   └── recommendation.py
│   │
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   ├── yield_predictor.py
│   │   │   ├── price_forecaster.py
│   │   │   └── crop_recommender.py
│   │   ├── preprocessing/
│   │   │   ├── feature_engineering.py
│   │   │   └── data_validation.py
│   │   └── inference/
│   │       └── predictor.py
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── session.py
│   │   └── init_db.py
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── logger.py
│   │   ├── validators.py
│   │   └── helpers.py
│   │
│   └── middleware/
│       ├── __init__.py
│       ├── auth.py
│       ├── cors.py
│       └── rate_limit.py
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_api/
│   ├── test_services/
│   └── test_ml/
│
├── alembic/                       # Database migrations
│   ├── versions/
│   └── env.py
│
├── scripts/
│   ├── init_db.py
│   └── seed_data.py
│
├── requirements.txt
├── requirements-dev.txt
├── .env.example
├── alembic.ini
└── pyproject.toml
```

**Key Technologies:**
- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **Database:** PostgreSQL (asyncpg)
- **Cache:** Redis (aioredis)
- **Task Queue:** Celery
- **ML:** Scikit-learn, TensorFlow, XGBoost
- **Auth:** JWT (python-jose)
- **Testing:** Pytest
- **Migrations:** Alembic

---

## 3. Technology Stack

### Frontend Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 | Component-based UI |
| Build Tool | Vite | Fast development & build |
| Language | JavaScript/JSX | Frontend development |
| Styling | Tailwind CSS | Utility-first CSS |
| State Management | Redux Toolkit | Global state |
| Forms | React Hook Form | Form handling |
| Validation | Zod | Schema validation |
| Charts | Recharts | Data visualization |
| Maps | React-Leaflet | Geospatial display |
| HTTP Client | Axios | API requests |
| Routing | React Router v6 | Client-side routing |

### Backend Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | FastAPI | High-performance API |
| Language | Python 3.11+ | Backend development |
| ORM | SQLAlchemy 2.0 | Database ORM |
| Validation | Pydantic v2 | Data validation |
| Database | PostgreSQL | Relational data |
| NoSQL | MongoDB | Flexible schemas |
| Cache | Redis | Performance |
| Task Queue | Celery | Background tasks |
| Auth | JWT (python-jose) | Authentication |
| Testing | Pytest | Unit/integration tests |
| Migrations | Alembic | Database migrations |

### ML/AI Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| ML Library | Scikit-learn | Classical ML |
| Deep Learning | TensorFlow/PyTorch | Neural networks |
| Gradient Boosting | XGBoost/LightGBM | Ensemble models |
| Data Processing | Pandas | Data manipulation |
| Numerical | NumPy | Numerical computing |
| Visualization | Matplotlib/Seaborn | Plotting |
| Model Serving | FastAPI | ML API serving |

### DevOps Stack
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containerization | Docker | Application packaging |
| Orchestration | Docker Compose | Local development |
| CI/CD | GitHub Actions | Automation |
| Monitoring | Prometheus + Grafana | Metrics & dashboards |
| Logging | ELK Stack | Log aggregation |
| Cloud | AWS / GCP / Railway | Infrastructure |

---

## 4. Data Architecture

### 4.1 Database Schema (PostgreSQL with SQLAlchemy)

```python
# models/user.py
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

# models/land.py
class Land(Base):
    __tablename__ = "lands"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_hectares = Column(Float)
    soil_type = Column(String(100))
    soil_ph = Column(Float)
    elevation_meters = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

# models/crop.py
class Crop(Base):
    __tablename__ = "crops"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    scientific_name = Column(String(255))
    category = Column(String(100))
    growing_season = Column(String(50))
    water_requirement = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())

# models/recommendation.py
class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    land_id = Column(UUID(as_uuid=True), ForeignKey("lands.id"), nullable=False)
    crop_id = Column(UUID(as_uuid=True), ForeignKey("crops.id"))
    predicted_yield = Column(Float)
    predicted_price = Column(Float)
    expected_profit = Column(Float)
    confidence_score = Column(Float)
    recommendation_date = Column(DateTime)
    status = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())
```

### 4.2 Pydantic Schemas

```python
# schemas/land.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class LandBase(BaseModel):
    name: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    area_hectares: Optional[float] = Field(None, gt=0)
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = Field(None, ge=0, le=14)
    elevation_meters: Optional[int] = None

class LandCreate(LandBase):
    pass

class LandUpdate(LandBase):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class LandInDB(LandBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

---

## 5. API Design

### 5.1 RESTful API Endpoints (FastAPI)

```python
# app/api/v1/endpoints/lands.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.land import LandCreate, LandUpdate, LandInDB
from app.services.land_analysis import LandAnalysisService

router = APIRouter()

@router.post("/", response_model=LandInDB, status_code=201)
async def create_land(
    land: LandCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new land parcel"""
    return await LandAnalysisService.create_land(db, land, current_user.id)

@router.get("/", response_model=List[LandInDB])
async def list_lands(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all lands for current user"""
    return await LandAnalysisService.get_user_lands(db, current_user.id, skip, limit)

@router.get("/{land_id}", response_model=LandInDB)
async def get_land(
    land_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific land details"""
    land = await LandAnalysisService.get_land(db, land_id, current_user.id)
    if not land:
        raise HTTPException(status_code=404, detail="Land not found")
    return land

@router.post("/{land_id}/analyze")
async def analyze_land(
    land_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze land suitability"""
    return await LandAnalysisService.analyze_suitability(db, land_id)
```

### 5.2 API Response Format

```python
# Standard success response
{
    "success": True,
    "data": {
        # Response data
    },
    "meta": {
        "timestamp": "2026-02-16T10:30:00Z",
        "version": "1.0"
    }
}

# Error response
{
    "success": False,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input data",
        "details": [
            {
                "field": "soil_ph",
                "message": "Must be between 0 and 14"
            }
        ]
    },
    "meta": {
        "timestamp": "2026-02-16T10:30:00Z"
    }
}
```

---

## 6. ML Pipeline

### 6.1 Yield Prediction Service

```python
# app/ml/models/yield_predictor.py
import joblib
import numpy as np
from typing import Dict, Any

class YieldPredictor:
    def __init__(self, model_path: str):
        self.model = joblib.load(model_path)
        
    def predict(self, features: Dict[str, Any]) -> Dict[str, float]:
        """
        Predict crop yield based on input features
        
        Args:
            features: Dict containing soil_type, soil_ph, temperature, 
                     rainfall, crop_type, etc.
        
        Returns:
            Dict with predicted_yield, confidence_score
        """
        # Feature engineering
        X = self._prepare_features(features)
        
        # Prediction
        yield_pred = self.model.predict(X)[0]
        confidence = self._calculate_confidence(X)
        
        return {
            "predicted_yield": float(yield_pred),
            "confidence_score": float(confidence),
            "unit": "kg/hectare"
        }
    
    def _prepare_features(self, features: Dict) -> np.ndarray:
        # Feature engineering logic
        pass
    
    def _calculate_confidence(self, X: np.ndarray) -> float:
        # Confidence calculation
        pass
```

### 6.2 Model Training Pipeline

```python
# scripts/train_models.py
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
import pandas as pd
import joblib

def train_yield_model():
    # Load data
    df = pd.read_csv('data/crop_yield_data.csv')
    
    # Feature engineering
    X = prepare_features(df)
    y = df['yield']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    model = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    score = model.score(X_test, y_test)
    print(f"Model R² Score: {score}")
    
    # Save model
    joblib.dump(model, 'models/yield_predictor.pkl')
    
    return model
```

---

## 7. Security Architecture

### 7.1 Authentication (JWT)

```python
# app/core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception
    return user
```

---

## 8. Deployment Architecture

### 8.1 MVP Deployment (Hackathon)

```
┌─────────────────────────────────────┐
│         Vercel (Frontend)           │
│  - React application                │
│  - Edge functions                   │
│  - CDN distribution                 │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Railway (Backend)              │
│  - FastAPI application              │
│  - PostgreSQL database              │
│  - Redis cache                      │
└─────────────────────────────────────┘
```

### 8.2 Production Deployment (Future)

```
┌─────────────────────────────────────────────────────┐
│                  AWS / GCP Cloud                    │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  CloudFront / Cloud CDN (Frontend)           │  │
│  │  - React static assets                       │  │
│  │  - Global edge caching                       │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  Application Load Balancer                   │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  ECS / Kubernetes Cluster                    │  │
│  │  ┌────────────┐  ┌────────────┐              │  │
│  │  │  FastAPI   │  │  Celery    │              │  │
│  │  │  Service   │  │  Workers   │              │  │
│  │  │  (3 pods)  │  │  (2 pods)  │              │  │
│  │  └────────────┘  └────────────┘              │  │
│  └──────────────────────────────────────────────┘  │
│                       ↓                             │
│  ┌──────────────┐  ┌──────────────┐               │
│  │  RDS         │  │  ElastiCache │               │
│  │ (PostgreSQL) │  │   (Redis)    │               │
│  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────┘
```

---

## 9. Scalability Strategy

### 9.1 Horizontal Scaling
- **FastAPI Services:** Auto-scaling based on CPU/memory (2-10 instances)
- **Celery Workers:** Task-based scaling for ML inference
- **Database:** Read replicas for query distribution

### 9.2 Caching Strategy
- **Redis Cache:**
  - Weather data (TTL: 1 hour)
  - Market prices (TTL: 30 minutes)
  - User sessions (TTL: 7 days)
  - ML predictions (TTL: 24 hours)

### 9.3 Performance Targets
| Metric | Target |
|--------|--------|
| API Response Time | < 200ms (p95) |
| ML Inference Time | < 500ms |
| Page Load Time | < 2s |
| Uptime | 99.9% |
| Concurrent Users | 10,000+ |

---

## 10. Development Workflow

```
┌─────────────┐
│  Developer  │
└──────┬──────┘
       │ 1. Code changes
       ↓
┌─────────────────────────────────┐
│  Git (Feature Branch)           │
└──────┬──────────────────────────┘
       │ 2. Push to GitHub
       ↓
┌─────────────────────────────────┐
│  GitHub Actions (CI)            │
│  - Lint code (Black, Flake8)    │
│  - Run tests (Pytest)           │
│  - Build Docker image           │
└──────┬──────────────────────────┘
       │ 3. Create Pull Request
       ↓
┌─────────────────────────────────┐
│  Code Review                    │
└──────┬──────────────────────────┘
       │ 4. Merge to main
       ↓
┌─────────────────────────────────┐
│  GitHub Actions (CD)            │
│  - Deploy to staging            │
│  - Run integration tests        │
│  - Deploy to production         │
└─────────────────────────────────┘
```

---

**Document Status:** ✅ Updated for React + Python Stack  
**Next Review:** Post-MVP Development  
**Maintained By:** RootAura Engineering Team
