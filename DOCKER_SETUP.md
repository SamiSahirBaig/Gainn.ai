# 🐳 Gainn.ai — Docker Setup Guide

> Launch the entire stack with a single command.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| **Docker** | ≥ 24.x | `docker --version` |
| **Docker Compose** | ≥ 2.x | `docker compose version` |

---

## 🚀 Quick Start

```bash
# 1. Clone & enter project
git clone https://github.com/SamiSahirBaig/Gainn.ai.git
cd Gainn.ai
git checkout new_main

# 2. Start core services (Postgres + Redis + MongoDB + Backend + Frontend)
docker-compose up -d

# 3. Run database migrations & seed data
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed_users.py
docker-compose exec backend python scripts/seed_crops.py
docker-compose exec backend python -m app.ml.train_yield_model
```

Open http://localhost:5173 → Login: `farmer@gainn.ai` / `Farmer@123`

---

## 📦 Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React + Vite (hot-reload) |
| **Backend API** | http://localhost:8000 | FastAPI |
| **Swagger Docs** | http://localhost:8000/docs | API documentation |
| **ReDoc** | http://localhost:8000/redoc | Alternative API docs |
| **PostgreSQL** | `localhost:5432` | Primary database |
| **Redis** | `localhost:6379` | Cache |
| **MongoDB** | `localhost:27017` | Flexible schemas |
| **pgAdmin** | http://localhost:5050 | DB management (profile: tools) |
| **Redis Commander** | http://localhost:8081 | Redis UI (profile: tools) |

---

## 🛠️ Common Commands

```bash
# Start all core services
docker-compose up -d

# Start with admin tools (pgAdmin + Redis Commander)
docker-compose --profile tools up -d

# Start with Celery workers (when celery_app module is created)
docker-compose --profile workers up -d

# Start everything
docker-compose --profile workers --profile tools up -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after Dockerfile changes
docker-compose up -d --build

# Rebuild a single service
docker-compose up -d --build backend

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Run backend tests
docker-compose exec backend pytest

# Open a shell in the backend container
docker-compose exec backend bash

# Check service health
docker-compose ps
```

---

## 🔑 Default Credentials

### Application
| Email | Password | Role |
|-------|----------|------|
| `farmer@gainn.ai` | `Farmer@123` | User |
| `admin@gainn.ai` | `Admin@123` | Admin |
| `demo@gainn.ai` | `Demo@123` | User |

> Run `docker-compose exec backend python scripts/seed_users.py` first.

### Docker Services
| Service | Username | Password |
|---------|----------|----------|
| PostgreSQL | `rootaura` | `rootaura_dev_password` |
| pgAdmin | `admin@rootaura.io` | `admin` |
| MongoDB | `rootaura` | `rootaura_dev_password` |

---

## 📂 Docker Files

```
Gainn.ai/
├── docker-compose.yml        # Full-stack orchestration
├── backend/
│   ├── Dockerfile            # Multi-stage Python build
│   ├── .dockerignore
│   └── .env.example
└── frontend/
    ├── Dockerfile            # Node.js dev server
    ├── .dockerignore
    ├── .env.example
    └── nginx.conf            # Production nginx config
```

---

## ⚠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 5432 in use | `sudo lsof -ti:5432 \| xargs kill -9` or stop local PostgreSQL |
| Port 8000 in use | `sudo lsof -ti:8000 \| xargs kill -9` |
| Backend won't start | Check `docker-compose logs backend` — may need DB migration |
| Frontend blank page | Run `docker-compose up -d --build frontend` |
| Permission denied | `sudo chown -R $USER:$USER .` |
| CORS errors | Verify `CORS_ORIGINS` includes `http://localhost:5173` |
| DB connection refused | Wait for Postgres health check: `docker-compose logs postgres` |
| Slow first build | Normal — Python deps + node_modules take time on first run |

---

## 🔄 Development Workflow

1. **Code changes** — Edit files locally (hot-reload active for both frontend and backend)
2. **New Python dependency** — Add to `requirements.txt`, then `docker-compose up -d --build backend`
3. **New Node dependency** — `docker-compose exec frontend npm install <pkg>`
4. **DB migration** — `docker-compose exec backend alembic revision --autogenerate -m "description"` then `docker-compose exec backend alembic upgrade head`
5. **Run tests** — `docker-compose exec backend pytest`

---

## 📝 Notes

- **Hot-reload** works for both frontend (Vite) and backend (uvicorn `--reload`) via Docker volume mounts
- **Celery worker** is behind `--profile workers` and requires the `celery_app` module (not yet created)
- **node_modules** is stored in an anonymous Docker volume to prevent conflicts with host OS
- **ML models** are persisted in a named volume (`ml_models`)
- The setup works on **Linux**, **macOS**, and **Windows (WSL2)**
