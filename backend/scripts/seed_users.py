"""
Seed test users (including one admin).

Usage:
    cd backend
    source venv/bin/activate
    python scripts/seed_users.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User

TEST_USERS = [
    {
        "email": "admin@gainn.ai",
        "full_name": "Admin User",
        "password": "Admin@123",
        "is_superuser": True,
    },
    {
        "email": "farmer@gainn.ai",
        "full_name": "Test Farmer",
        "password": "Farmer@123",
        "is_superuser": False,
    },
    {
        "email": "demo@gainn.ai",
        "full_name": "Demo User",
        "password": "Demo@123",
        "is_superuser": False,
    },
]


def seed():
    db = SessionLocal()
    added = 0
    skipped = 0

    try:
        for u in TEST_USERS:
            exists = db.query(User).filter(User.email == u["email"]).first()
            if exists:
                skipped += 1
                continue

            user = User(
                email=u["email"],
                full_name=u["full_name"],
                hashed_password=get_password_hash(u["password"]),
                is_active=True,
                is_superuser=u["is_superuser"],
            )
            db.add(user)
            added += 1

        db.commit()
        print(f"✅ Seeded {added} users ({skipped} already existed)")
        print()
        print("Test credentials:")
        for u in TEST_USERS:
            role = "admin" if u["is_superuser"] else "user"
            print(f"  {u['email']} / {u['password']}  ({role})")
    except Exception as exc:
        db.rollback()
        print(f"❌ Error: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
