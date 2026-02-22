#!/bin/bash
# Railway startup script — runs migrations, seeds, and starts the server
set -e

echo "🚀 Gainn.ai Backend — Starting up..."

# Run database migrations
echo "📦 Running database migrations..."
python -m alembic upgrade head

# Seed data (only inserts if not already present)
echo "🌱 Seeding initial data..."
python scripts/seed_crops.py 2>/dev/null || echo "⚠️ Crop seeding skipped (may already exist)"
python scripts/seed_users.py 2>/dev/null || echo "⚠️ User seeding skipped (may already exist)"

# Train ML model if not present
if [ ! -f "models/yield_model.pkl" ]; then
    echo "🤖 Training ML model..."
    python -m app.ml.train_yield_model 2>/dev/null || echo "⚠️ ML training skipped"
fi

# Start the server
echo "✅ Starting uvicorn on port ${PORT:-8000}..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" \
    --workers "${WEB_CONCURRENCY:-2}"
