# RootAura - Project Setup Guide

This guide will help you set up the RootAura development environment with **React frontend** and **Python backend**.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Manual Setup](#manual-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/))
- **Redis** 7+ ([Download](https://redis.io/))
- **Git** ([Download](https://git-scm.com/))

### Optional (Recommended)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Python
  - Pylance
  - Tailwind CSS IntelliSense
  - Thunder Client (API testing)

---

## Quick Start with Docker

The fastest way to get started is using Docker Compose:

```bash
# 1. Clone the repository
git clone https://github.com/SamiSahirBaig/ROOTAURA.git
cd ROOTAURA

# 2. Start all services
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### With Management Tools

```bash
# Start with pgAdmin and Redis Commander
docker-compose --profile tools up -d

# Access management tools
# pgAdmin: http://localhost:5050 (admin@rootaura.io / admin)
# Redis Commander: http://localhost:8081
```

### With Celery Workers

```bash
# Start with background task workers
docker-compose --profile workers up -d
```

### Docker Commands

```bash
# View logs
docker-compose logs -f [service_name]

# Stop all services
docker-compose down

# Rebuild services
docker-compose up -d --build

# Reset everything (WARNING: deletes data)
docker-compose down -v
```

---

## Manual Setup

### 1. Clone Repository

```bash
git clone https://github.com/SamiSahirBaig/ROOTAURA.git
cd ROOTAURA
```

### 2. Setup Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# VITE_API_URL=http://localhost:8000
# VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

### 3. Setup Backend (Python FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL=postgresql://rootaura:password@localhost:5432/rootaura
# REDIS_URL=redis://localhost:6379
# SECRET_KEY=your-secret-key-here
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30

# Run database migrations
alembic upgrade head

# Seed database (optional)
python scripts/seed_data.py

# Start development server
uvicorn app.main:app --reload
```

Backend API will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

---

## Environment Configuration

### Frontend (.env.local)

```env
# API Endpoints
VITE_API_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_SOCIAL_INTELLIGENCE=true

# Map Configuration
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Environment
VITE_ENV=development
```

### Backend (.env)

```env
# Environment
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://rootaura:password@localhost:5432/rootaura

# Redis
REDIS_URL=redis://localhost:6379

# MongoDB (optional)
MONGODB_URL=mongodb://localhost:27017/rootaura

# Authentication
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Celery (Background Tasks)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# External APIs
WEATHER_API_KEY=your_weather_api_key
MARKET_DATA_API_KEY=your_market_api_key

# CORS
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# ML Models
MODEL_PATH=./models
MODEL_VERSION=1.0.0
```

---

## Database Setup

### PostgreSQL Setup

```bash
# Create database
createdb rootaura

# Or using psql
psql -U postgres
CREATE DATABASE rootaura;
\q

# Run migrations (from backend directory)
cd backend
source venv/bin/activate
alembic upgrade head

# Create initial admin user (optional)
python scripts/create_admin.py
```

### Redis Setup

```bash
# Start Redis server
redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

### MongoDB Setup (Optional)

```bash
# Start MongoDB
mongod

# Create database and user
mongosh
use rootaura
db.createUser({
  user: "rootaura",
  pwd: "password",
  roles: ["readWrite"]
})
```

---

## Running the Application

### Development Mode

**Option 1: Run all services separately**

```bash
# Terminal 1 - Frontend (React + Vite)
cd frontend
npm run dev

# Terminal 2 - Backend (FastAPI)
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 3 - Redis (if not running)
redis-server

# Terminal 4 - PostgreSQL (if not running)
postgres -D /usr/local/var/postgres

# Terminal 5 - Celery Worker (optional)
cd backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

**Option 2: Use Docker Compose**

```bash
docker-compose up -d
```

### Production Mode

```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
cd backend
source venv/bin/activate
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

---

## Verification

### Check Services

```bash
# Frontend
curl http://localhost:5173

# Backend API
curl http://localhost:8000/api/v1/health

# API Documentation
open http://localhost:8000/docs

# PostgreSQL
psql -U rootaura -d rootaura -c "SELECT version();"

# Redis
redis-cli ping
```

### Run Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
source venv/bin/activate
pytest

# With coverage
pytest --cov=app --cov-report=html
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5173  # Frontend
lsof -i :8000  # Backend

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql "postgresql://rootaura:password@localhost:5432/rootaura"

# Reset database
dropdb rootaura
createdb rootaura
cd backend && alembic upgrade head
```

### Redis Connection Issues

```bash
# Check Redis is running
redis-cli ping

# Restart Redis
redis-cli shutdown
redis-server
```

### Python Virtual Environment Issues

```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Alembic Migration Issues

```bash
# Check migration status
alembic current

# Reset migrations
alembic downgrade base
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"
```

### Docker Issues

```bash
# Reset Docker environment
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## Next Steps

1. ✅ **Read the documentation**
   - [REQUIREMENTS.md](./REQUIREMENTS.md) - Product requirements
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

2. ✅ **Explore the codebase**
   - Frontend: `frontend/src/`
   - Backend: `backend/app/`

3. ✅ **Run the tests**
   ```bash
   npm test      # Frontend
   pytest        # Backend
   ```

4. ✅ **Start developing**
   - Pick an issue from GitHub Issues
   - Create a feature branch
   - Make your changes
   - Submit a pull request

---

## Useful Commands

### Frontend (React + Vite)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run tests
```

### Backend (Python FastAPI)
```bash
# Development
uvicorn app.main:app --reload              # Start dev server
uvicorn app.main:app --reload --port 8001  # Custom port

# Database
alembic revision --autogenerate -m "msg"   # Create migration
alembic upgrade head                       # Run migrations
alembic downgrade -1                       # Rollback

# Testing
pytest                                     # Run all tests
pytest --cov=app                          # With coverage
pytest -v                                 # Verbose

# Code Quality
black .                                   # Format code
flake8 .                                  # Lint code
mypy app/                                 # Type checking

# Celery
celery -A app.celery_app worker --loglevel=info  # Worker
celery -A app.celery_app beat --loglevel=info    # Scheduler
```

---

## Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search [GitHub Issues](https://github.com/SamiSahirBaig/ROOTAURA/issues)
3. Create a new issue with detailed information
4. Join our [Discord community](https://discord.gg/rootaura)
5. Email: team@rootaura.io

---

**Happy Coding! 🌱**
