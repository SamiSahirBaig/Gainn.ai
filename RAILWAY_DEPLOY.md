# 🚀 Gainn.ai — Railway Deployment Guide

> Deploy the full stack to [Railway.app](https://railway.app) — Backend, Frontend, PostgreSQL, and Redis.

---

## Architecture on Railway

```
┌─────────────────────────────────────────────────────────┐
│                    Railway Project                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   Frontend   │  │   Backend    │                    │
│  │  (Vite/Nginx)│──│  (FastAPI)   │                    │
│  │   Port 80    │  │  Port $PORT  │                    │
│  └──────────────┘  └──────┬───────┘                    │
│                           │                             │
│              ┌────────────┼────────────┐                │
│              │            │            │                │
│  ┌───────────▼──┐  ┌─────▼──────┐                     │
│  │  PostgreSQL  │  │   Redis    │                      │
│  │  (Add-on)    │  │  (Add-on)  │                      │
│  └──────────────┘  └────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

You'll create **4 services** inside one Railway project.

---

## Step-by-Step Setup

### 1. Create a Railway Project

1. Go to [railway.app](https://railway.app) → Sign in with GitHub
2. Click **"New Project"**
3. Select **"Empty Project"**

---

### 2. Add PostgreSQL Database

1. Inside the project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-provisions the database and provides a `DATABASE_URL`
3. Click the PostgreSQL service → **"Variables"** tab → copy `DATABASE_URL`

> Railway provides the URL in the format:  
> `postgresql://postgres:xxx@xxx.railway.internal:5432/railway`

---

### 3. Add Redis

1. Click **"+ New"** → **"Database"** → **"Redis"**
2. Railway auto-provisions Redis and provides a `REDIS_URL`
3. Copy `REDIS_URL` from the Variables tab

---

### 4. Deploy the Backend

1. Click **"+ New"** → **"GitHub Repo"** → Select **Gainn.ai**
2. In the service settings:

#### Settings Tab
| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Builder** | Dockerfile |
| **Start Command** | `bash start.sh` |

#### Variables Tab — Add these:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (click "Add Reference") |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` (click "Add Reference") |
| `SECRET_KEY` | Generate a strong random key (e.g. `openssl rand -hex 32`) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |
| `ENVIRONMENT` | `production` |
| `LOG_LEVEL` | `INFO` |
| `CORS_ORIGINS` | `["https://YOUR-FRONTEND.up.railway.app"]` |
| `OPENWEATHERMAP_API_KEY` | Your API key (optional) |
| `MARKET_DATA_API_KEY` | Your API key (optional) |
| `SENTINEL_HUB_CLIENT_ID` | Your ID (optional) |
| `SENTINEL_HUB_CLIENT_SECRET` | Your secret (optional) |

> ⚠️ Replace `YOUR-FRONTEND` with the actual frontend domain after deploying it (step 5). You can update this later.

#### Networking Tab
- Click **"Generate Domain"** to get a public URL like `gainnai-backend.up.railway.app`

---

### 5. Deploy the Frontend

1. Click **"+ New"** → **"GitHub Repo"** → Select **Gainn.ai** (same repo, different config)
2. In the service settings:

#### Settings Tab
| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Builder** | Dockerfile |
| **Dockerfile Path** | `Dockerfile.prod` |

#### Variables Tab — Add these:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://YOUR-BACKEND.up.railway.app` |

> Replace with the actual backend domain from step 4.

#### Networking Tab
- Click **"Generate Domain"** to get a public URL like `gainnai-frontend.up.railway.app`

---

### 6. Update CORS (After Both Deploy)

Once both services have domains, go back to the **Backend** service variables and update:

```
CORS_ORIGINS=["https://gainnai-frontend.up.railway.app"]
```

If you add a custom domain later, include it too:
```
CORS_ORIGINS=["https://gainnai-frontend.up.railway.app","https://gainn.ai"]
```

---

## Custom Domain (Optional)

1. Go to the **Frontend** service → **Settings** → **Networking**
2. Click **"+ Custom Domain"**
3. Enter your domain (e.g., `gainn.ai`)
4. Add the CNAME record at your DNS provider:
   - **Type:** CNAME
   - **Name:** `@` or `www`
   - **Value:** `gainnai-frontend.up.railway.app`
5. Railway auto-provisions SSL/HTTPS

---

## Environment Variables — Quick Reference

### Backend (Required)

| Variable | Source | Example |
|----------|--------|---------|
| `DATABASE_URL` | Railway Postgres reference | `${{Postgres.DATABASE_URL}}` |
| `REDIS_URL` | Railway Redis reference | `${{Redis.REDIS_URL}}` |
| `SECRET_KEY` | Manual — **change from default** | `a3f8b2c1d9e7...` |
| `CORS_ORIGINS` | Manual — frontend URL | `["https://your-frontend.up.railway.app"]` |
| `ENVIRONMENT` | Manual | `production` |

### Backend (Optional — for live data)

| Variable | Source |
|----------|--------|
| `OPENWEATHERMAP_API_KEY` | [openweathermap.org](https://openweathermap.org/api) |
| `MARKET_DATA_API_KEY` | [data.gov.in](https://data.gov.in/) |
| `SENTINEL_HUB_CLIENT_ID` | [sentinel-hub.com](https://www.sentinel-hub.com/) |
| `SENTINEL_HUB_CLIENT_SECRET` | Same as above |

### Frontend

| Variable | Source |
|----------|--------|
| `VITE_API_URL` | Backend's Railway domain |

---

## Files Created for Railway

| File | Purpose |
|------|---------|
| `backend/start.sh` | Startup script — runs migrations, seeds data, starts uvicorn |
| `frontend/Dockerfile.prod` | Production build — Vite → nginx with SPA routing |
| `frontend/nginx.conf` | Nginx config with gzip, caching, API proxy, security headers |

---

## Monitoring & Logs

- **View logs:** Click any service → **"Deployments"** tab → click a deployment → **"View Logs"**
- **Health check:** Visit `https://YOUR-BACKEND.up.railway.app/api/v1/health`
- **API docs:** Visit `https://YOUR-BACKEND.up.railway.app/docs`
- **Redeploy:** Push to the `new_main` branch — Railway auto-deploys

---

## Estimated Costs

Railway's **Starter Plan** ($5/month) includes:
- 512 MB RAM per service
- 1 GB disk
- $5 credit (covers small projects)

For Gainn.ai, expect **~$5–10/month** for all 4 services during low traffic.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend crashes on startup | Check logs. Usually a missing `DATABASE_URL` env var |
| `alembic upgrade` fails | Ensure `DATABASE_URL` points to the Railway Postgres instance |
| Frontend shows blank page | Verify `VITE_API_URL` is set to the backend's full URL (with `https://`) |
| CORS errors in browser | Update `CORS_ORIGINS` to include the frontend's Railway domain |
| 502 Bad Gateway | Backend may still be starting – wait 30s. Check deployment logs |
| API works but returns fallback data | Add `OPENWEATHERMAP_API_KEY` and `MARKET_DATA_API_KEY` env vars |

---

## Deployment Checklist

- [ ] Railway project created
- [ ] PostgreSQL add-on provisioned
- [ ] Redis add-on provisioned
- [ ] Backend service deployed from `backend/` with `Dockerfile`
- [ ] Backend env vars set (DATABASE_URL, REDIS_URL, SECRET_KEY, CORS_ORIGINS)
- [ ] Backend domain generated
- [ ] Frontend service deployed from `frontend/` with `Dockerfile.prod`
- [ ] Frontend env var set (VITE_API_URL = backend domain)
- [ ] Frontend domain generated
- [ ] CORS_ORIGINS updated with frontend domain
- [ ] Health check passes: `https://backend-domain/api/v1/health`
- [ ] Login works: `farmer@gainn.ai` / `Farmer@123`
