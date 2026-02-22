# 🌱 GAINN - Global Agriculture Intelligence Neural Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Status: MVP Development](https://img.shields.io/badge/Status-MVP%20Development-blue.svg)]()

> **Transforming farming from uncertainty into intelligent decision-making**

GAINN (Global Agriculture Intelligence Neural Network) is an AI-powered agricultural decision platform designed specifically for farmers with low literacy levels. It helps farmers determine the most profitable crop to grow based on land analysis, market intelligence, and real-time data - all through an extremely simple, visual interface.

---

## 🎯 Problem We're Solving

Farmers face critical challenges:
- ❌ **Crop selection based on guesswork** - No data-driven recommendations
- ❌ **Complex agricultural apps** - Too technical for low-literacy farmers
- ❌ **Manual land measurement** - Time-consuming and error-prone
- ❌ **Lack of market intelligence** - Don't know which crops are in demand
- ❌ **Poor profit visibility** - Can't calculate actual profitability
- ❌ **No nearby market information** - Don't know where to sell for best prices

**Result:** Reduced profitability, increased risk, inefficient resource usage

---

## 💡 Our Solution

GAINN provides a **farmer-friendly platform** with:
- ✅ **Interactive map-based land selection** - Draw land boundaries with finger/mouse
- ✅ **Auto-fetch environmental data** - Soil, elevation, weather, NPK values
- ✅ **AI-powered crop recommendations** - Top 5 most profitable crops
- ✅ **Detailed profit analysis** - Complete cost breakdown and ROI
- ✅ **Market intelligence** - Real-time prices, demand-supply analysis
- ✅ **Nearby markets** - Find best markets with Google Maps integration
- ✅ **Simple visual UI** - Icons, colors, minimal text for low-literacy users

---

## 🚀 MVP Features (Week 1 Focus)

### 1. 🗺️ Interactive Map-Based Land Selection
**The Game Changer**
- Draw land boundaries directly on map with finger/mouse
- Auto-calculate land area (acres/hectares)
- Auto-fetch environmental data:
  - Elevation
  - Soil type and pH
  - Organic matter content
  - NPK values (Nitrogen, Phosphorus, Potassium)
  - Climate data (temperature, rainfall, humidity)
- Visual confirmation of selected area
- Edit/adjust boundaries easily

**APIs Integrated:**
- Google Maps API (map interface)
- SoilGrids API (soil data)
- Google Elevation API (elevation)
- OpenWeatherMap API (climate data)

### 2. 🌾 AI-Powered Crop Recommendations
**Real, Data-Driven Results**
- Top 5 crop recommendations ranked by profitability
- For each crop:
  - **Suitability Score** (0-100%)
  - **Expected Yield** (tons/acre)
  - **Profit Analysis:**
    - Total revenue estimate
    - Complete cost breakdown (seeds, fertilizer, labor, equipment, etc.)
    - Net profit
    - ROI percentage
  - **Best Market Recommendation:**
    - Market name and location
    - Distance from land
    - Current price
    - Expected price at harvest
    - Logistics cost
  - **Growing Season** (best planting/harvest times)
  - **Risk Assessment** (weather, market volatility)

**Detailed Crop Analysis Modal:**
- Market trends (6-12 month price chart)
- Demand-supply analysis
- Price forecast (3-6 months)
- Seasonal patterns
- Competition analysis
- Growing requirements
- Success rate in region

### 3. 📍 Dashboard with Market Intelligence
**Simple, Visual, Actionable**

**Nearby Markets:**
- Find agricultural markets within 50km
- Show for each market:
  - Name, address, distance
  - Current prices for major crops
  - Demand-supply indicators
  - Travel time and directions
- Sort by: distance, best prices, highest demand

**Real-Time Weather:**
- Current weather conditions
- 7-day forecast
- Farming recommendations based on weather
- Alerts for extreme weather

**Live Market Data:**
- Real-time crop prices
- Price trends (up/down/stable)
- Hot crops (high demand, rising prices)
- Cold crops (low demand, falling prices)
- Best selling opportunities

### 4. 📊 Market Intelligence Page
**Redesigned for Simplicity**

**Top 5 Recommended Crops:**
- Best crops to grow based on current market
- Demand level, price, profitability
- Simple reasons why recommended

**High Demand Crops:**
- Crops with very high demand
- "Hot selling" opportunities
- Supply-demand indicators

**Low Demand Crops (Avoid):**
- Oversupplied crops
- Falling prices
- Warning indicators

**Best Price Crops:**
- Crops with best current prices
- Price increase trends
- Best time to sell

**Best Markets:**
- Top markets with highest prices
- Most variety
- Farmer-friendly policies

### 5. 🎨 Farmer-Friendly UI/UX
**Designed for Low-Literacy Users**

**Visual Design:**
- Large touch targets (48x48px minimum)
- High contrast for sunlight readability
- Simple, universal icons
- Minimal text, maximum visuals
- Consistent color coding:
  - 🟢 Green = Good/Profit/Success
  - 🔴 Red = Bad/Loss/Warning
  - 🟡 Yellow = Caution/Medium
  - 🔵 Blue = Information
- Large fonts (16px minimum, 24px+ headings)
- 5th-grade reading level language
- Regional language support (Hindi, Marathi, etc.)

**Simplified Navigation:**
- Maximum 4-5 main sections
- Bottom navigation with icons
- Clear visual hierarchy
- Always-visible back button
- Always-accessible home button

**Simplified Forms:**
- Sliders instead of text inputs
- Dropdowns for selections
- Toggle switches for yes/no
- Visual pickers
- Auto-fill wherever possible
- Real-time validation with visual feedback

**No Complex Graphs:**
- Simple cards with icons
- Visual indicators (✓, ✗, !)
- Large, tappable buttons
- Clear section separation

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              User Interface Layer (React)               │
│  Simple, Visual, Farmer-Friendly, Mobile-First          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Python Backend (FastAPI)                    │
│  Authentication, API Routing, Business Logic             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌──────────────┬──────────────┬──────────────┬────────────┐
│   Land       │    Crop      │   Market     │  External  │
│  Analysis    │Recommendation│ Intelligence │    APIs    │
│   Engine     │    Engine    │    Engine    │  (Google,  │
│              │              │              │  Weather)  │
└──────────────┴──────────────┴──────────────┴────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Machine Learning Models (Scikit-learn)           │
│  Suitability, Yield Prediction, Profit Calculation       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Database (PostgreSQL + Redis)               │
│  User Data, Land Data, Analysis Results, Cache           │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Redux Toolkit
- **Maps:** Google Maps API / React-Leaflet
- **Charts:** Recharts (minimal use)
- **Routing:** React Router v6
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Migrations:** Alembic
- **Authentication:** JWT (python-jose)

### Machine Learning
- **Framework:** Scikit-learn
- **Data Processing:** Pandas, NumPy
- **Models:**
  - Crop Suitability (Random Forest)
  - Yield Prediction (Gradient Boosting)
  - Profit Calculator (Custom algorithm)

### External APIs
- **Google Maps API** - Map interface, places, directions
- **Google Elevation API** - Elevation data
- **SoilGrids API** - Soil type, pH, nutrients
- **OpenWeatherMap API** - Weather and climate data
- **AGMARKNET** - Market prices (India)

### DevOps
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Frontend Deployment:** Vercel
- **Backend Deployment:** Railway
- **Monitoring:** Sentry (error tracking)

---

## 📁 Project Structure

```
Gainn.ai/
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── analysis/   # Land analysis components
│   │   │   ├── dashboard/  # Dashboard widgets
│   │   │   ├── market/     # Market intelligence
│   │   │   ├── results/    # Results page components
│   │   │   └── layout/     # Layout components
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LandAnalysis.jsx
│   │   │   ├── Results.jsx
│   │   │   └── Market.jsx
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   ├── i18n/            # Internationalization
│   │   │   ├── index.js     # i18n config
│   │   │   └── locales/     # en.json, hi.json, mr.json, te.json
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── backend/                  # Python FastAPI server
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   │   └── v1/
│   │   │       ├── auth.py
│   │   │       ├── land.py
│   │   │       ├── analysis.py
│   │   │       ├── market.py
│   │   │       └── weather.py
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   │   ├── google_maps_service.py
│   │   │   ├── soil_data_service.py
│   │   │   ├── weather_service.py
│   │   │   └── market_service.py
│   │   ├── ml/              # ML models & inference
│   │   │   ├── suitability_model.py
│   │   │   ├── yield_predictor.py
│   │   │   ├── profit_calculator.py
│   │   │   └── market_analyzer.py
│   │   └── core/            # Core utilities
│   ├── tests/               # Test files
│   ├── alembic/             # Database migrations
│   └── requirements.txt
│
├── docs/                     # Documentation
├── .github/                  # GitHub Actions workflows
├── REQUIREMENTS.md           # Detailed requirements
├── ARCHITECTURE.md           # System architecture
└── README.md                # This file
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 15+
- **Redis** 7+ (optional for caching)
- **Google Maps API Key**
- **OpenWeatherMap API Key**

### Quick Start

#### 1. Clone the Repository
```bash
git clone https://github.com/SamiSahirBaig/Gainn.ai.git
cd Gainn.ai
```

#### 2. Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database and API keys

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload
```

Backend will run on `http://localhost:8000`

#### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with backend URL and API keys

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### Environment Variables

**Backend (.env)**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gainn
REDIS_URL=redis://localhost:6379

# Authentication
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
OPENWEATHER_API_KEY=your-openweather-key
SOILGRIDS_API_URL=https://rest.isric.org/soilgrids/v2.0

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Database Setup
```bash
# Create PostgreSQL database
createdb gainn

# Run migrations
cd backend
alembic upgrade head

# (Optional) Seed sample data
python scripts/seed_data.py
```

---

## 📊 Current Development Status

### ✅ Completed (Issues #1-14)
- [x] Backend structure (FastAPI, models, schemas)
- [x] Frontend structure (React, Redux, components)
- [x] Authentication system (JWT)
- [x] Database models and migrations
- [x] ML model structure (suitability, yield, profit)
- [x] NDVI service integration
- [x] Basic UI components
- [x] API endpoint structure

### 🚧 In Progress (Week 1 - Issues #26-34)
- [ ] **#34 - Connect Frontend to Backend** (CRITICAL BLOCKER)
- [ ] **#26 - Interactive Map-Based Land Selection**
- [ ] **#27 - Real Crop Recommendations with Backend**
- [ ] **#31 - Simplify UI/UX for Farmers**
- [ ] **#28 - Nearby Markets with Google Maps**
- [ ] **#29 - Real-Time Weather Widget**
- [ ] **#30 - Live Market Data Feed**
- [ ] **#33 - Redesign Market Intelligence**
- [ ] **#32 - Remove Simulation UI**

### 🎯 MVP Goals (Week 1)
1. **Functional land analysis** with map-based selection
2. **Real crop recommendations** with profit analysis
3. **Market intelligence** with nearby markets
4. **Simple, farmer-friendly UI** throughout
5. **End-to-end working demo** for hackathon

---

## 🎨 Design Philosophy

### For Farmers with Low Literacy
1. **Visual First** - Icons and colors over text
2. **Simple Language** - 5th-grade reading level
3. **Large Touch Targets** - Easy to tap on mobile
4. **Consistent Colors** - Green=good, Red=bad, Yellow=caution
5. **Minimal Steps** - Reduce cognitive load
6. **Auto-Fill Everything** - Minimize manual input
7. **Regional Languages** - Hindi, Marathi, etc.
8. **Offline Support** - Works with poor connectivity

### Mobile-First Approach
- Designed for smartphones (most farmers use phones)
- Works on low-end devices
- Optimized for 2G/3G networks
- Touch-friendly interface
- Readable in sunlight (high contrast)

---

## 📖 Documentation

- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Detailed product requirements
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
- **[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)** - Development roadmap
- **[PRIORITY_GUIDE.md](./PRIORITY_GUIDE.md)** - Issue priorities and workflow
- **[API_DOCS.md](./API_DOCS.md)** - API documentation

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Map-based land selection
- [ ] Auto-fetch environmental data
- [ ] Crop recommendation generation
- [ ] Profit calculation accuracy
- [ ] Market data display
- [ ] Weather widget
- [ ] Mobile responsiveness
- [ ] Regional language support

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Railway)
```bash
cd backend
# Connect to Railway
railway login
railway link
railway up
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Write tests for new features
- Update documentation
- Keep UI simple and farmer-friendly
- Test on mobile devices
- Consider low-literacy users

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- **Farmers** who inspired this project
- **Open source community** for amazing tools
- **Contributors and supporters**
- **Hackathon organizers** for the opportunity

---

## 📞 Contact

**Project Repository:** https://github.com/SamiSahirBaig/Gainn.ai

**Maintainer:** Sami Sahir Baig  
**Email:** samisahirbaig@gmail.com

---

## 🎯 Hackathon Focus

### What Makes GAINN Special?
1. **Farmer-First Design** - Built for low-literacy users
2. **Map-Based Selection** - No manual measurements needed
3. **Auto-Fetch Data** - Soil, weather, elevation automatically
4. **Real Market Intelligence** - Live prices and demand analysis
5. **Complete Profit Analysis** - Every cost accounted for
6. **Nearby Markets** - Find best selling locations
7. **Simple Visual UI** - Icons, colors, minimal text

### Demo Flow
1. **Login** → Simple, visual interface
2. **Select Land** → Draw on map with finger
3. **Auto-Fetch** → System gets all environmental data
4. **Get Recommendations** → Top 5 profitable crops
5. **View Details** → Complete profit breakdown
6. **Find Markets** → Best nearby markets with prices
7. **Make Decision** → Informed, data-driven choice

---

**🌱 GAINN - Empowering farmers with intelligent decisions through AI! 🚀**
