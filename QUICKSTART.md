# 🚀 RootAura - Quick Start Guide

Get RootAura running in **5 minutes** or less!

---

## ⚡ Fastest Way (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/SamiSahirBaig/ROOTAURA.git
cd ROOTAURA

# 2. Start everything with Docker
docker-compose up -d

# 3. Open your browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**That's it! You're ready to develop.** 🎉

---

## 🛠️ Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Step 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/SamiSahirBaig/ROOTAURA.git
cd ROOTAURA

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Step 2: Setup Environment

```bash
# Frontend
cd frontend
cp .env.example .env.local
# Edit .env.local:
# VITE_API_URL=http://localhost:8000

# Backend
cd ../backend
cp .env.example .env
# Edit .env:
# DATABASE_URL=postgresql://rootaura:password@localhost:5432/rootaura
# REDIS_URL=redis://localhost:6379
# SECRET_KEY=your-secret-key-here
```

### Step 3: Setup Database

```bash
# Create PostgreSQL database
createdb rootaura

# Run migrations
cd backend
alembic upgrade head

# Seed data (optional)
python scripts/seed_data.py
```

### Step 4: Start Services

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 3 - Redis
redis-server

# Terminal 4 - Celery Worker (optional)
cd backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

### Step 5: Verify

Open your browser:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📁 Project Structure

```
ROOTAURA/
├── frontend/              # React + Vite web app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── store/        # Redux store
│   └── package.json
│
├── backend/               # Python FastAPI server
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── ml/           # ML models
│   └── requirements.txt
│
├── REQUIREMENTS.md        # Product requirements
├── ARCHITECTURE.md        # System architecture
└── docker-compose.yml    # Docker configuration
```

---

## 🎯 What to Build First (MVP)

### Week 1 Sprint Tasks

#### Day 1-2: Foundation ✅
- [x] Project setup (DONE!)
- [ ] Database schema
- [ ] Basic React components
- [ ] FastAPI endpoints

#### Day 3-4: Core Features
- [ ] Land analysis module
- [ ] Yield prediction engine
- [ ] Profit calculator

#### Day 5-6: Integration
- [ ] Connect React to FastAPI
- [ ] Add visualizations
- [ ] Scenario simulator

#### Day 7: Polish
- [ ] Demo preparation
- [ ] Presentation deck
- [ ] Bug fixes

---

## 🔧 Essential Commands

### Frontend (React + Vite)
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
```

### Backend (Python FastAPI)
```bash
# Development
uvicorn app.main:app --reload              # Start dev server
uvicorn app.main:app --reload --port 8001  # Custom port

# Database
alembic revision --autogenerate -m "message"  # Create migration
alembic upgrade head                          # Run migrations
alembic downgrade -1                          # Rollback one migration

# Testing
pytest                                     # Run all tests
pytest tests/test_api/                    # Run specific tests
pytest --cov=app                          # Run with coverage

# Code Quality
black .                                   # Format code
flake8 .                                  # Lint code
mypy app/                                 # Type checking

# Celery (Background Tasks)
celery -A app.celery_app worker --loglevel=info  # Start worker
celery -A app.celery_app beat --loglevel=info    # Start scheduler
```

### Docker
```bash
docker-compose up -d                      # Start all services
docker-compose --profile workers up -d    # Start with Celery workers
docker-compose --profile tools up -d      # Start with management tools
docker-compose logs -f [service]          # View logs
docker-compose down                       # Stop all services
docker-compose down -v                    # Stop and remove data
docker-compose up -d --build              # Rebuild and start
```

---

## 📚 Key Documentation

1. **[REQUIREMENTS.md](./REQUIREMENTS.md)** - What we're building and why
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - How it's built
3. **[ROADMAP.md](./ROADMAP.md)** - Where we're going
4. **[PROJECT_SETUP.md](./PROJECT_SETUP.md)** - Detailed setup guide
5. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute

---

## 🆘 Common Issues

### Port Already in Use
```bash
# Find and kill process
lsof -i :5173  # Frontend
lsof -i :8000  # Backend
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
brew services restart postgresql  # macOS
sudo service postgresql restart   # Linux
```

### Redis Connection Failed
```bash
# Start Redis
redis-server

# Or with Homebrew (macOS)
brew services start redis
```

### Python Virtual Environment Issues
```bash
# Recreate venv
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
# Reset migrations
alembic downgrade base
alembic upgrade head

# Or recreate database
dropdb rootaura
createdb rootaura
alembic upgrade head
```

---

## 🎓 Learning Resources

### For Frontend Developers
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org/)

### For Backend Developers
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [Pydantic v2](https://docs.pydantic.dev/latest/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)

### For ML Engineers
- [Scikit-learn Guide](https://scikit-learn.org/stable/user_guide.html)
- [TensorFlow Tutorials](https://www.tensorflow.org/tutorials)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)

---

## 🎯 MVP Goals

Build a working demo that shows:
1. ✅ Land suitability analysis
2. ✅ Crop yield prediction
3. ✅ Profit comparison
4. ✅ Market optimization
5. ✅ Scenario simulation

**Success = Functional demo + Clear value proposition**

---

## 🤝 Need Help?

- **Documentation Issues?** Check [PROJECT_SETUP.md](./PROJECT_SETUP.md)
- **Technical Questions?** Open a GitHub issue
- **Want to Contribute?** Read [CONTRIBUTING.md](./CONTRIBUTING.md)
- **General Questions?** Email: team@rootaura.io

---

## 🌟 Next Steps

1. ✅ Get the project running (you're here!)
2. 📖 Read [REQUIREMENTS.md](./REQUIREMENTS.md) to understand the vision
3. 🏗️ Review [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the structure
4. 💻 Start coding! Pick a task from [ROADMAP.md](./ROADMAP.md)
5. 🚀 Build something amazing!

---

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

These provide interactive API documentation where you can test endpoints directly.

---

## 🔑 Default Credentials (Development)

**Database:**
- Host: localhost
- Port: 5432
- Database: rootaura
- Username: rootaura
- Password: rootaura_dev_password

**Redis:**
- Host: localhost
- Port: 6379

**pgAdmin (if using Docker with tools profile):**
- URL: http://localhost:5050
- Email: admin@rootaura.io
- Password: admin

---

**Ready to transform agriculture? Let's build RootAura! 🌱**

*Made with ❤️ for farmers worldwide*
