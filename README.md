# 🌱 RootAura - Social AI Agricultural Decision Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Status: MVP Development](https://img.shields.io/badge/Status-MVP%20Development-blue.svg)]()

> **Transforming farming from uncertainty into intelligent decision-making**

RootAura is a social AI-powered agricultural decision platform that helps farmers determine the most profitable crop to grow on their land based on environmental suitability, predicted yield, market demand, and collective farmer activity.

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

RootAura provides:
- ✅ **Data-driven crop recommendations** based on land analysis
- ✅ **Yield prediction** using machine learning
- ✅ **Profit optimization** through market intelligence
- ✅ **Social intelligence** to prevent oversupply
- ✅ **Precision farming schedules** for optimal resource use
- ✅ **Market optimization** for best selling strategies

---

## 🚀 Key Features

### 1. 🌍 Land Suitability Analysis
Analyzes land characteristics to determine crop compatibility
- Soil type, pH, nutrient analysis
- Topography and elevation
- Climate suitability scoring

### 2. 📊 Yield Prediction Engine
ML-powered yield forecasting for different crops
- Historical data analysis
- Environmental factor integration
- Confidence intervals and risk assessment

### 3. 💰 Profit Optimization Engine
Calculates expected profitability for each crop
- Market price prediction
- Input cost analysis
- ROI comparison across crops

### 4. 🤝 Social Intelligence Layer (Network Effect)
**Our most powerful differentiator**
- Analyzes collective farmer activity
- Detects oversupply risks early
- Recommends alternative crops
- Improves with more users

### 5. 📅 Precision Resource Schedule
Personalized farming plan with:
- Irrigation schedule
- Fertilizer timing
- Pest management
- Harvest optimization

### 6. 🎮 Scenario Simulation
"What-if" simulator for:
- Climate variations
- Resource changes
- Market fluctuations

### 7. 📈 Market Optimization
- Best market identification
- Profit comparisons
- Opportunity alerts
- Optimal selling timing

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                 │
│  (Web App, Mobile App, Progressive Web App)             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API Gateway / Backend                  │
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
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Redux Toolkit
- **Charts:** Recharts
- **Maps:** Leaflet

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL + MongoDB
- **Cache:** Redis
- **ORM:** Prisma

### ML/AI
- **Language:** Python 3.11+
- **Framework:** FastAPI
- **ML:** Scikit-learn, TensorFlow, XGBoost
- **Data:** Pandas, NumPy

### DevOps
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Deployment:** Vercel (Frontend), Railway (Backend)
- **Monitoring:** Prometheus + Grafana

---

## 📁 Project Structure

```
ROOTAURA/
├── frontend/                 # Next.js web application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Next.js pages
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── api/             # Routes & controllers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   └── utils/           # Utilities
│   └── package.json
│
├── ml-services/              # Python ML services
│   ├── src/
│   │   ├── models/          # ML models
│   │   ├── data/            # Data processing
│   │   └── api/             # FastAPI endpoints
│   └── requirements.txt
│
├── docs/                     # Documentation
│   ├── api/                 # API documentation
│   ├── ml/                  # ML model docs
│   └── deployment/          # Deployment guides
│
├── REQUIREMENTS.md           # Product requirements
├── ARCHITECTURE.md           # System architecture
└── README.md                # This file
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
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
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

4. **Setup ML Services**
```bash
cd ml-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

### Environment Variables

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
```

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/rootaura
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
PORT=3001
```

**ML Services (.env)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/rootaura
MODEL_PATH=./models
PORT=8000
```

---

## 📖 Documentation

- **[Product Requirements](./REQUIREMENTS.md)** - Detailed PRD
- **[Architecture](./ARCHITECTURE.md)** - System design and architecture
- **[API Documentation](./docs/api/)** - API endpoints and usage
- **[ML Models](./docs/ml/)** - Model documentation
- **[Deployment Guide](./docs/deployment/)** - Deployment instructions

---

## 🎯 MVP Scope (Hackathon)

The hackathon MVP demonstrates:
- ✅ Land analysis simulation
- ✅ Crop recommendation engine
- ✅ Yield prediction simulation
- ✅ Profit comparison system
- ✅ Market optimization logic
- ✅ Scenario simulation

**Goal:** Validate core concept and win hackathon! 🏆

---

## 📊 Success Metrics

### Hackathon Metrics
- Working crop recommendation demo
- Clear profit optimization logic
- Functional simulation interface
- Strong presentation

### Future Metrics
- Prediction accuracy > 80%
- User adoption: 1,000 farmers in 6 months
- Profit improvement: >15% for users
- User retention: >60% monthly

---

## 🗺️ Roadmap

### Phase 1: MVP (Hackathon) ✅
- Basic crop recommendation
- Yield prediction
- Profit comparison
- Demo UI

### Phase 2: Beta (6 months)
- Real-time weather integration
- Advanced ML models
- Mobile application
- 1,000+ users

### Phase 3: Growth (1 year)
- IoT sensor integration
- Satellite imagery
- Marketplace platform
- 10,000+ users

### Phase 4: Scale (2+ years)
- Global network
- Blockchain integration
- Fully automated recommendations
- 100,000+ users

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 👥 Team

- **Product Owner:** RootAura Team
- **Tech Lead:** [Your Name]
- **ML Engineer:** [Name]
- **Full-Stack Developer:** [Name]
- **UI/UX Designer:** [Name]

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- Agricultural research institutions for data
- Open-source community
- Hackathon organizers
- Farmers who inspired this project

---

## 📞 Contact

- **Website:** [rootaura.io](https://rootaura.io) (coming soon)
- **Email:** team@rootaura.io
- **Twitter:** [@RootAura](https://twitter.com/rootaura)
- **Discord:** [Join our community](https://discord.gg/rootaura)

---

## 🌟 Star Us!

If you find RootAura useful, please consider giving us a star ⭐ on GitHub!

---

**Made with ❤️ for farmers worldwide**

*Transforming agriculture, one prediction at a time* 🌾
