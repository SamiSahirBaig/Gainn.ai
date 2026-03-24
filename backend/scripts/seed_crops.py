"""
Seed the crops table from crop_requirements.json.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/seed_crops.py
"""

import json
import sys
from pathlib import Path

# Ensure the backend package is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.models.crop import Crop

_DATA_FILE = Path(__file__).resolve().parent.parent / "app" / "ml" / "data" / "crop_requirements.json"


def seed():
    with open(_DATA_FILE) as f:
        crops_data = json.load(f)

    db = SessionLocal()
    added = 0
    skipped = 0

    try:
        for c in crops_data:
            exists = db.query(Crop).filter(Crop.name == c["name"]).first()
            if exists:
                skipped += 1
                continue

            crop = Crop(
                name=c["name"],
                category=c.get("category", ""),
                growth_duration=c.get("growth_duration"),
                optimal_temp_min=c.get("temp_min"),
                optimal_temp_max=c.get("temp_max"),
                water_requirement=c.get("rainfall_min"),  # approximate
                optimal_ph_min=c.get("ph_min"),
                optimal_ph_max=c.get("ph_max"),
                preferred_soil_types=",".join(c.get("soil_types", [])),
            )
            db.add(crop)
            added += 1

        db.commit()
        print(f"✅ Seeded {added} crops ({skipped} already existed)")
    except Exception as exc:
        db.rollback()
        print(f"❌ Error: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
