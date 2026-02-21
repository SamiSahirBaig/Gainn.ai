# 🌱 GAINN - Global Agriculture Intelligence Neural Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Status: MVP Development](https://img.shields.io/badge/Status-MVP%20Development-blue.svg)]()

> **Transforming farming from uncertainty into intelligent decision-making**

GAINN (Global Agriculture Intelligence Neural Network) is a social AI-powered agricultural decision platform that helps farmers determine the most profitable crop to grow on their land based on environmental suitability, predicted yield, market demand, and collective farmer activity.

---

## 🎯 Problem We're Solving

Farmers face critical challenges:
- ❌ Crop selection based on guesswork or tradition
- ❌ Oversupply causing severe price drops
- ❌ Lack of predictive market insights
- ❌ Poor environmental suitability analysis
- ❌ Limited visibility into profitable markets
- ❌ No unified decision-making system

**Result:** Reduced profitability, increased risk, inefficient resource usage

---

## 💡 Our Solution

GAINN provides:
- ✅ **Data-driven crop recommendations** based on land analysis
- ✅ **Yield prediction** using machine learning
- ✅ **Profit optimization** through market intelligence
- ✅ **Social intelligence** to prevent oversupply
- ✅ **Precision farming schedules** for optimal resource use
- ✅ **Market optimization** for best selling strategies

---

## 🚀 Key Features

### 1. 🌍 Land Suitability Analysis
- Interactive map-based land selection (draw polygon or click)
- Auto-fetch soil, elevation, and climate data from global APIs
- NDVI satellite vegetation analysis (Sentinel Hub)
- Multi-step wizard: Location → Soil → Climate → Analyze

### 2. 📊 ML-Powered Crop Recommendations
- Top 5 crop recommendations ranked by suitability score
- XGBoost yield prediction with confidence intervals
- Profit calculation with cost breakdown and ROI
- Star ratings, "why this crop" checklists — farmer-friendly

### 3. 🌤️ Live Weather Intelligence
- Real-time weather from OpenWeatherMap API
- 5-day forecast with farming activity recommendations
- Irrigation alerts, heat wave warnings, best farming days
- Auto-refresh every 15 minutes

### 4. 📈 Live Market Intelligence
- Real-time crop prices from AGMARKNET (data.gov.in) for 15 major crops
- 🔥 High Demand / ❄️ Low Demand / 💰 Best Price analysis
- Top 5 recommended crops with opportunity scoring
- 60 real APMC markets across 21 Indian states
- Distance-sorted nearby markets with interactive Leaflet map

### 5. 👨‍🌾 Farmer-Friendly UI (Low Literacy Design)
- Large icons, minimal text, color-coded everything
- Star ratings instead of percentages
- Simple language: "Sell Now" / "Wait to Sell"
- Mobile-first with bottom navigation bar
- Touch targets optimized for mobile devices

### 6. 🔐 Authentication & Security
- JWT-based login/register with Redux state management
- Auto-redirect on 401, secure token storage
- Global error boundary for graceful error handling

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                 │
│              (React Web App + Mobile App)               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Python Backend (FastAPI)              │
│  (Authentication, Authorization, Request Routing)        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌──────────────┬──────────────┬──────────────┬────────────┐
│   Land       │    Yield     │   Market     │  Social    │
│  Analysis    │  Prediction  │ Intelligence │ Intelligence│
│   Engine     │    Engine    │    Engine    │   Engine   │
└──────────────┴──────────────┴──────────────┴────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Machine Learning Pipeline                   │
│  (Training, Inference, Model Management)                 │
└─────────────────────────────────────────────────────────┘
```

**[View Full Architecture →](./ARCHITECTURE.md)**

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Redux Toolkit
- **Charts:** Recharts
- **Maps:** React-Leaflet
- **Routing:** React Router v6

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **Database:** PostgreSQL
- **Cache:** Redis
- **Task Queue:** Celery
- **Migrations:** Alembic

### ML/AI
- **Framework:** FastAPI
- **ML:** Scikit-learn, TensorFlow, XGBoost
- **Data:** Pandas, NumPy
- **Visualization:** Matplotlib, Seaborn

### DevOps
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel (Frontend), Railway (Backend)
- **Monitoring:** Prometheus + Grafana

---

## 📁 Project Structure

```
GAINN/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Python FastAPI server
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── ml/              # ML models & inference
│   │   └── core/            # Core utilities
│   ├── tests/               # Test files
│   ├── alembic/             # Database migrations
│   └── requirements.txt
│
├── docs/                     # Documentation
├── REQUIREMENTS.md           # Product requirements
├── ARCHITECTURE.md           # System architecture
└── README.md                # This file
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SamiSahirBaig/ROOTAURA.git
cd ROOTAURA
```

2. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

3. **Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

4. **Setup Database**
```bash
# Create PostgreSQL database
createdb gainn

# Run migrations
cd backend
alembic upgrade head

# Seed data (optional)
python scripts/seed_data.py
```

### Environment Variables

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:8000
```

**Backend (.env)**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rootaura
REDIS_URL=redis://localhost:6379

# Auth
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs (required for live data)
OPENWEATHERMAP_API_KEY=your_owm_key          # Weather + farming tips
MARKET_DATA_API_KEY=your_agmarknet_key        # Live crop prices
SENTINEL_HUB_CLIENT_ID=your_client_id        # Satellite NDVI
SENTINEL_HUB_CLIENT_SECRET=your_secret       # Satellite NDVI

# Free APIs (no key needed)
SOILGRIDS_API_URL=https://rest.isric.org/soilgrids/v2.0
OPEN_ELEVATION_API_URL=https://api.open-elevation.com/api/v1
```

> **Note:** The app works without API keys using synthetic fallback data. Add real keys for live weather, market prices, and satellite imagery.

---

## 📖 Documentation

- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Product requirements and features
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick setup guide
- **[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)** - Development roadmap
- **[PRIORITY_GUIDE.md](./PRIORITY_GUIDE.md)** - Issue priorities and workflow

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- All farmers who inspired this project
- Open source community for amazing tools
- Contributors and supporters

---

## 📞 Contact

**Project Link:** https://github.com/SamiSahirBaig/ROOTAURA

**Maintainer:** Sami Sahir Baig - samisahirbaig@gmail.com

---

**🌱 GAINN - Empowering farmers with intelligent decisions through neural networks! 🚀**
