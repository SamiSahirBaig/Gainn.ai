"""
Shared pytest fixtures for the Gainn.ai test suite.
"""

import os
import sys
import pytest
from pathlib import Path

# Ensure backend is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Override DATABASE_URL for testing BEFORE any app imports
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-do-not-use-in-prod")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.db.base import Base
from app.core.deps import get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.user import User

# ── Test DB engine ───────────────────────────────────────
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    """Create all tables once per test session, drop at teardown."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Yield a fresh DB session, rolling back after each test."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture()
def client(db):
    """FastAPI TestClient with the test DB session injected."""

    def _override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def test_user(db):
    """Create and return a test user in the DB."""
    user = db.query(User).filter(User.email == "test@gainn.ai").first()
    if not user:
        user = User(
            email="test@gainn.ai",
            full_name="Test User",
            hashed_password=get_password_hash("Test@123"),
            is_active=True,
            is_superuser=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@pytest.fixture()
def auth_headers(client, test_user):
    """Login the test user and return Authorization headers."""
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": "test@gainn.ai", "password": "Test@123"},
    )
    token = resp.json().get("access_token", "")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def sample_land_data():
    """Standard land input for analysis tests."""
    return {
        "soil_type": "loamy",
        "soil_ph": 6.5,
        "nitrogen": 250,
        "phosphorus": 45,
        "potassium": 200,
        "temperature": 28,
        "rainfall": 1100,
        "irrigation_available": True,
        "latitude": 17.385,
        "longitude": 78.4867,
    }
