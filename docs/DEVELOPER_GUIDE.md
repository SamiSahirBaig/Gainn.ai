# Developer Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Git

## Quick Start

```bash
# Clone
git clone https://github.com/SamiSahirBaig/Gainn.ai.git
cd Gainn.ai

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit with your credentials

# Database
alembic upgrade head
python scripts/seed_crops.py
python scripts/seed_users.py

# Start backend
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

## Project Structure

```
Gainn.ai/
├── backend/
│   ├── alembic/              # Database migrations
│   │   ├── env.py
│   │   └── versions/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── api.py        # Router aggregator
│   │   │   └── endpoints/    # Route handlers
│   │   ├── core/
│   │   │   ├── config.py     # Pydantic settings
│   │   │   ├── deps.py       # DI (get_db, get_current_user)
│   │   │   └── security.py   # JWT + password hashing
│   │   ├── db/
│   │   │   ├── base.py       # DeclarativeBase + TimestampMixin
│   │   │   └── session.py    # Engine + SessionLocal
│   │   ├── ml/
│   │   │   ├── suitability.py       # Crop suitability scoring
│   │   │   ├── yield_prediction.py  # Random Forest predictor
│   │   │   ├── profit_calculator.py # Profit/ROI engine
│   │   │   ├── train_yield_model.py # Model training script
│   │   │   └── data/               # JSON data files
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/
│   │   │   └── ndvi_service.py # Sentinel-2 NDVI integration
│   │   └── main.py           # FastAPI app entry point
│   ├── scripts/               # Seed data scripts
│   ├── tests/                 # Pytest tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── analysis/      # Analysis-related components
│   │   │   ├── auth/          # AuthForm
│   │   │   ├── dashboard/     # Dashboard widgets
│   │   │   ├── layout/        # Header, Sidebar, Footer
│   │   │   ├── market/        # Market intelligence components
│   │   │   ├── results/       # Result display components
│   │   │   └── simulation/    # What-If simulation components
│   │   ├── pages/             # Route-level page components
│   │   ├── services/          # API service layer (axios)
│   │   └── store/             # Redux Toolkit store + slices
│   └── package.json
└── docs/                      # Documentation
```

## Coding Standards

### Backend (Python)
- **Style**: PEP 8 with 100-char line limit
- **Type hints**: Required for function signatures
- **Docstrings**: Google-style for all public functions
- **Imports**: Group by stdlib → third-party → local, separated by blank lines
- **Async**: Use `async def` for I/O-bound endpoints

### Frontend (React)
- **Components**: Functional components with hooks only
- **State**: Redux Toolkit for global state, `useState` for local
- **Styling**: Tailwind CSS utility classes
- **Naming**: PascalCase for components, camelCase for functions/variables

## Adding New Features

### New API Endpoint
1. Create/update schema in `app/schemas/`
2. Create endpoint function in `app/api/v1/endpoints/`
3. Register router in `app/api/v1/api.py`
4. Write tests in `tests/test_api/`

### New ML Model
1. Add training script in `app/ml/`
2. Create predictor class with lazy loading
3. Integrate into analysis endpoint
4. Add data files to `app/ml/data/`
5. Write tests in `tests/test_ml/`

### New Frontend Page
1. Create page component in `src/pages/`
2. Create sub-components in `src/components/<feature>/`
3. Add route in `App.jsx`
4. Add sidebar link in `Sidebar.jsx`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SECRET_KEY` | JWT signing key | ✅ |
| `REDIS_URL` | Redis connection string | ❌ |
| `SENTINEL_HUB_CLIENT_ID` | Sentinel Hub API ID | ❌ |
| `SENTINEL_HUB_CLIENT_SECRET` | Sentinel Hub API secret | ❌ |
| `CORS_ORIGINS` | Allowed CORS origins | ❌ |

## Git Workflow

1. Create feature branch from `main`: `git checkout -b feature/issue-XX-description`
2. Make commits with conventional format: `feat(scope): description`
3. Run tests before pushing: `pytest`
4. Open PR against `main`
5. Squash-merge after review

## Debugging Tips

- **Swagger UI**: Visit `http://localhost:8000/docs` for interactive API testing
- **SQL echo**: Set `ECHO_SQL=true` in `.env` to log all queries
- **NDVI fallback**: If Sentinel Hub is slow/unavailable, the service auto-falls back to synthetic data — check `data_source` field
- **Slow startup**: First import of `sentinelhub` takes several minutes due to heavy dependencies
