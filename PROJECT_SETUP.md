# RootAura - Project Setup Guide

This guide will help you set up the RootAura development environment on your local machine.

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
- **Node.js** 20+ ([Download](https://nodejs.org/))
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
  - Prisma
  - Tailwind CSS IntelliSense

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
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# ML Services: http://localhost:8000
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

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_ML_API_URL=http://localhost:8000

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL=postgresql://user:password@localhost:5432/rootaura
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-secret-key
# PORT=3001

# Run database migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

Backend API will be available at: http://localhost:3001

### 4. Setup ML Services

```bash
cd ml-services

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
# DATABASE_URL=postgresql://user:password@localhost:5432/rootaura
# MODEL_PATH=./models
# PORT=8000

# Start development server
uvicorn src.api.main:app --reload --port 8000
```

ML API will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

---

## Environment Configuration

### Frontend (.env.local)

```env
# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ML_API_URL=http://localhost:8000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_SOCIAL_INTELLIGENCE=true

# Map Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://rootaura:password@localhost:5432/rootaura

# Redis
REDIS_URL=redis://localhost:6379

# MongoDB (optional)
MONGODB_URL=mongodb://localhost:27017/rootaura

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# External APIs
WEATHER_API_KEY=your_weather_api_key
MARKET_DATA_API_KEY=your_market_api_key

# CORS
CORS_ORIGIN=http://localhost:3000
```

### ML Services (.env)

```env
# Environment
ENVIRONMENT=development
PORT=8000

# Database
DATABASE_URL=postgresql://rootaura:password@localhost:5432/rootaura

# Redis
REDIS_URL=redis://localhost:6379

# Model Configuration
MODEL_PATH=./models
MODEL_VERSION=1.0.0

# ML Settings
BATCH_SIZE=32
MAX_WORKERS=4

# External APIs
WEATHER_API_KEY=your_weather_api_key
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
npx prisma migrate dev

# View database
npx prisma studio
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
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm run dev

# Terminal 3 - ML Services
cd ml-services && source venv/bin/activate && uvicorn src.api.main:app --reload

# Terminal 4 - Redis (if not running)
redis-server

# Terminal 5 - PostgreSQL (if not running)
postgres -D /usr/local/var/postgres
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
npm start

# Backend
cd backend
npm run build
npm start

# ML Services
cd ml-services
gunicorn -w 4 -k uvicorn.workers.UvicornWorker src.api.main:app
```

---

## Verification

### Check Services

```bash
# Frontend
curl http://localhost:3000

# Backend API
curl http://localhost:3001/api/health

# ML Services
curl http://localhost:8000/health

# PostgreSQL
psql -U rootaura -d rootaura -c "SELECT version();"

# Redis
redis-cli ping
```

### Run Tests

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test

# ML Services
cd ml-services && pytest
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or :3001, :8000

# Kill process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql "postgresql://user:password@localhost:5432/rootaura"

# Reset database
dropdb rootaura
createdb rootaura
cd backend && npx prisma migrate dev
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
   - Backend: `backend/src/`
   - ML Services: `ml-services/src/`

3. ✅ **Run the tests**
   ```bash
   npm test  # Frontend & Backend
   pytest    # ML Services
   ```

4. ✅ **Start developing**
   - Pick an issue from GitHub Issues
   - Create a feature branch
   - Make your changes
   - Submit a pull request

---

## Useful Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test             # Run tests
```

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
npx prisma studio    # Open Prisma Studio
npx prisma migrate   # Run migrations
```

### ML Services
```bash
uvicorn src.api.main:app --reload  # Start dev server
pytest                              # Run tests
black .                             # Format code
flake8 .                            # Lint code
python -m src.models.train          # Train models
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
