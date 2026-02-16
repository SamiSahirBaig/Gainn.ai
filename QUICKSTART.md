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
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# ML API: http://localhost:8000/docs
```

**That's it! You're ready to develop.** 🎉

---

## 🛠️ Manual Setup (Without Docker)

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Step 1: Clone & Install

```bash
# Clone repository
git clone https://github.com/SamiSahirBaig/ROOTAURA.git
cd ROOTAURA

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..

# Install ML dependencies
cd ml-services
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
# Edit .env.local with your settings

# Backend
cd ../backend
cp .env.example .env
# Edit .env with your database URL and secrets

# ML Services
cd ../ml-services
cp .env.example .env
# Edit .env with your settings
```

### Step 3: Setup Database

```bash
# Create PostgreSQL database
createdb rootaura

# Run migrations
cd backend
npx prisma migrate dev
```

### Step 4: Start Services

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm run dev

# Terminal 3 - ML Services
cd ml-services && source venv/bin/activate && uvicorn src.api.main:app --reload

# Terminal 4 - Redis
redis-server
```

### Step 5: Verify

Open your browser:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/health
- ML API: http://localhost:8000/docs

---

## 📁 Project Structure

```
ROOTAURA/
├── frontend/              # Next.js web app
├── backend/               # Node.js API
├── ml-services/           # Python ML services
├── docs/                  # Documentation
├── REQUIREMENTS.md        # Product requirements
├── ARCHITECTURE.md        # System architecture
├── ROADMAP.md            # Product roadmap
├── PROJECT_SETUP.md      # Detailed setup guide
└── docker-compose.yml    # Docker configuration
```

---

## 🎯 What to Build First (MVP)

### Week 1 Sprint Tasks

#### Day 1-2: Foundation ✅
- [x] Project setup (DONE!)
- [ ] Database schema
- [ ] Basic UI components
- [ ] API structure

#### Day 3-4: Core Features
- [ ] Land analysis module
- [ ] Yield prediction engine
- [ ] Profit calculator

#### Day 5-6: Integration
- [ ] Connect frontend to backend
- [ ] Add visualizations
- [ ] Scenario simulator

#### Day 7: Polish
- [ ] Demo preparation
- [ ] Presentation deck
- [ ] Bug fixes

---

## 🔧 Essential Commands

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm test         # Run tests
npm run lint     # Check code quality
```

### Backend
```bash
npm run dev          # Start dev server
npx prisma studio    # Open database UI
npx prisma migrate   # Run migrations
npm test             # Run tests
```

### ML Services
```bash
uvicorn src.api.main:app --reload  # Start dev server
pytest                              # Run tests
python -m src.models.train          # Train models
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose logs -f [service]  # View logs
docker-compose down               # Stop all services
docker-compose down -v            # Stop and remove data
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
lsof -i :3000  # or :3001, :8000
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

---

## 🎓 Learning Resources

### For Frontend Developers
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

### For Backend Developers
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

### For ML Engineers
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Scikit-learn Guide](https://scikit-learn.org/stable/user_guide.html)
- [TensorFlow Tutorials](https://www.tensorflow.org/tutorials)

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

**Ready to transform agriculture? Let's build RootAura! 🌱**

*Made with ❤️ for farmers worldwide*
