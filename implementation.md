# Gainn.ai — Implementation Guide

> Complete guide to get the full project running locally, from infrastructure to seed data.

---

## 🚀 Quick Start (Fedora — Complete First-Time Setup)

```bash
# 1. Start services
sudo postgresql-setup --initdb          # Only needed once, ever
sudo systemctl start postgresql && sudo systemctl enable postgresql
sudo systemctl start redis && sudo systemctl enable redis

# 2. Create database (run once)
sudo -u postgres psql -c "CREATE USER rootaura WITH PASSWORD 'password';"
sudo -u postgres psql -c "CREATE DATABASE rootaura OWNER rootaura;"
sudo sed -i 's/ident$/md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql

# 3. Backend setup (Terminal 1)
cd backend && source venv/bin/activate
alembic upgrade head
python scripts/seed_users.py
python scripts/seed_crops.py
python -m app.ml.train_yield_model       # Train ML model (~10s)
uvicorn app.main:app --reload

# 4. Frontend (Terminal 2)
cd frontend && npm run dev
```

Open http://localhost:5173 → Login: `farmer@gainn.ai` / `Farmer@123`

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| **Node.js** | ≥ 18.x | `node -v` |
| **npm** | ≥ 9.x | `npm -v` |
| **Python** | ≥ 3.10 | `python3 --version` |
| **PostgreSQL** | ≥ 15 | `psql --version` |
| **Redis** | ≥ 7 (optional) | `redis-cli ping` |
| **Docker** | ≥ 24 (optional) | `docker --version` |

---

## Option A — Docker (Recommended)

Spin up everything with one command:

```bash
# Clone and enter project
cd Gainn.ai

# Start core services (Postgres + Redis + MongoDB + Backend + Frontend)
docker-compose up -d

# Start with background workers
docker-compose --profile workers up -d

# Start with admin tools (pgAdmin + Redis Commander)
docker-compose --profile tools up -d

# Start everything
docker-compose --profile workers --profile tools up -d
```

### Service URLs (Docker)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| pgAdmin | http://localhost:5050 |
| Redis Commander | http://localhost:8081 |

### Docker Credentials

- **PostgreSQL**: `rootaura` / `rootaura_dev_password` — DB: `rootaura`
- **pgAdmin**: `admin@rootaura.io` / `admin`
- **MongoDB**: `rootaura` / `rootaura_dev_password`

After docker is running, skip to [Step 4 — Database Migrations](#step-4--database-migrations).

---

## Option B — Manual Setup

### Step 1 — Database

```bash
# Create PostgreSQL database
sudo -u postgres psql

# Inside psql:
CREATE USER rootaura WITH PASSWORD 'password';
CREATE DATABASE rootaura OWNER rootaura;
GRANT ALL PRIVILEGES ON DATABASE rootaura TO rootaura;
\q
```

Verify connection:
```bash
psql -U rootaura -d rootaura -h localhost
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment

Copy and edit the `.env` file:
```bash
cp .env.example .env   # or edit the existing .env
```

Key variables in `backend/.env`:
```ini
# Database
DATABASE_URL=postgresql://rootaura:password@localhost:5432/rootaura

# Authentication
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (must include your frontend URL)
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Redis (optional for MVP)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=INFO
ENVIRONMENT=development
```

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

#### Configure Environment (Optional)

Create `frontend/.env` if you need to override the default API URL:
```ini
VITE_API_URL=http://localhost:8000
```

> Default: `http://localhost:8000` (set in `src/services/api.js`)

---

### Step 4 — Database Migrations

```bash
cd backend
source venv/bin/activate

# Run all migrations
alembic upgrade head
```

#### Useful Alembic Commands
```bash
# Check current migration version
alembic current

# View migration history
alembic history

# Rollback one step
alembic downgrade -1

# Rollback everything
alembic downgrade base

# Create a new migration (after model changes)
alembic revision --autogenerate -m "description of change"
```

---

### Step 5 — Seed Data

```bash
cd backend
source venv/bin/activate

# Seed crop database (20+ Indian crops with pricing/yield data)
python scripts/seed_crops.py

# Seed test users (admin + farmer + demo)
python scripts/seed_users.py
```

#### Test Login Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@gainn.ai` | `Admin@123` | Admin |
| `farmer@gainn.ai` | `Farmer@123` | User |
| `demo@gainn.ai` | `Demo@123` | User |

---

### Step 6 — Start the Backend

```bash
cd backend
source venv/bin/activate

# Development server (with hot-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify: Open http://localhost:8000 — you should see:
```json
{
  "message": "Welcome to Gainn.ai API",
  "version": "1.0.0",
  "status": "running"
}
```

API docs: http://localhost:8000/docs

---

### Step 7 — Start the Frontend

```bash
cd frontend

# Development server (with hot-reload)
npm run dev
```

Open http://localhost:5173 — you'll see the Dashboard.

---

## Full Startup Sequence (Quick Reference)

Run these in **3 separate terminals**:

```bash
# Terminal 1 — Database (skip if already running)
sudo systemctl start postgresql
# Or: docker-compose up -d postgres redis

# Terminal 2 — Backend
cd backend && source venv/bin/activate
alembic upgrade head
python scripts/seed_crops.py
python scripts/seed_users.py
uvicorn app.main:app --reload --port 8000

# Terminal 3 — Frontend
cd frontend && npm run dev
```

---

## Project Structure

```
Gainn.ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # auth, land, analysis
│   │   ├── core/                # config, security, deps
│   │   ├── db/                  # session, base
│   │   ├── ml/                  # suitability, yield, profit
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response
│   │   ├── services/            # NDVI, external APIs
│   │   └── main.py              # FastAPI app entry point
│   ├── alembic/                 # Database migrations
│   ├── scripts/                 # Seed data scripts
│   ├── tests/                   # pytest test suite
│   ├── .env                     # Environment variables
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-level pages
│   │   ├── services/            # API service layer
│   │   ├── store/               # Redux state management
│   │   └── App.jsx              # Router + Layout
│   ├── package.json             # Node dependencies
│   └── vite.config.js           # Vite build config
├── docs/                        # API, DB schema, ML docs
└── docker-compose.yml           # Full-stack orchestration
```

---

## Authentication

Gainn.ai uses **JWT (JSON Web Token)** authentication with bcrypt password hashing.

### How It Works

```
1. User registers  →  POST /api/v1/auth/register  →  Account created
2. User logs in    →  POST /api/v1/auth/login     →  JWT token returned
3. User calls API  →  Authorization: Bearer <token> →  Authenticated request
4. Token expires   →  Re-login after 30 minutes
```

### Test Login Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@gainn.ai` | `Admin@123` | Admin |
| `farmer@gainn.ai` | `Farmer@123` | User |
| `demo@gainn.ai` | `Demo@123` | User |

> **Note:** Run `python scripts/seed_users.py` first to create these accounts.

### Auth via curl (Command Line)

**Register a new user:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","full_name":"Test User","phone":"+91-9999999999"}'
```

**Login and get JWT token:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -d "username=farmer@gainn.ai&password=Farmer@123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Use the token for authenticated requests:**
```bash
# Get profile
curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <paste_token_here>"

# Create a land analysis (authenticated)
curl -X POST http://localhost:8000/api/v1/analyses/ \
  -H "Authorization: Bearer <paste_token_here>" \
  -H "Content-Type: application/json" \
  -d '{"soil_type":"loamy","soil_ph":6.5,"nitrogen":250,"phosphorus":45,"potassium":200,"temperature":28,"rainfall":1100,"latitude":17.385,"longitude":78.487}'
```

### Auth via Frontend

1. Open http://localhost:5173/login
2. Enter `farmer@gainn.ai` / `Farmer@123`
3. Click **Sign In** — JWT is saved to localStorage automatically
4. All subsequent API requests include the token via Axios interceptor

### Configuration (`backend/.env`)

```ini
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Get JWT token |
| POST | `/api/v1/auth/refresh` | Refresh token |
| GET | `/api/v1/auth/me` | Get current user |
| PUT | `/api/v1/auth/me` | Update profile |

### Lands
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/lands/` | Create land parcel |
| GET | `/api/v1/lands/` | List user's lands |
| GET | `/api/v1/lands/{id}` | Get land details |
| PUT | `/api/v1/lands/{id}` | Update land |
| DELETE | `/api/v1/lands/{id}` | Delete land |

### Analyses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analyses/` | Run crop suitability analysis |
| GET | `/api/v1/analyses/` | List analyses |
| GET | `/api/v1/analyses/{id}` | Get analysis detail |
| GET | `/api/v1/analyses/{id}/recommendations` | Top-5 crop picks |
| GET | `/api/v1/analyses/{id}/ndvi` | NDVI satellite data |
| POST | `/api/v1/analyses/{id}/simulate` | What-if simulation |

---

## Frontend Pages

| Route | Page | Auth Required |
|-------|------|:---:|
| `/dashboard` | Dashboard overview | ❌ (demo data) |
| `/land-analysis` | Multi-step land form | ✅ (for submit) |
| `/results` | Crop recommendations | ✅ |
| `/simulation` | What-if scenarios | ✅ |
| `/market` | Market intelligence | ❌ (demo data) |
| `/login` | Sign in | ❌ |
| `/register` | Create account | ❌ |

---

## Running Tests

### Backend Tests
```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run only API tests
pytest tests/test_api/

# Run only ML tests
pytest tests/test_ml/

# Skip slow tests
pytest -m "not slow"
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `psycopg2` install fails | `sudo apt install libpq-dev python3-dev` |
| Port 5432 in use | `sudo lsof -i :5432` then kill the process |
| Port 8000 in use | `sudo lsof -i :8000` then kill the process |
| CORS errors in browser | Check `CORS_ORIGINS` in `backend/.env` includes your frontend URL |
| 401 on API calls | Login first at `/login` — JWT is stored in localStorage |
| Alembic can't connect | Verify `DATABASE_URL` in `.env` and Postgres is running |
| `ModuleNotFoundError` | Ensure virtualenv is active: `source venv/bin/activate` |
| Slow backend startup | `sentinelhub` import is heavy — first boot takes ~10s |
| Frontend blank page | Run `npm install` then `npm run dev` |
| Leaflet map tiles missing | Check internet connection (tiles load from OpenStreetMap CDN) |

---

## Production Build

```bash
# Frontend production bundle
cd frontend
npm run build          # outputs to dist/
npm run preview        # preview production build locally

# Backend production
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
