"""Tests for authentication endpoints."""


class TestLogin:
    def test_login_success(self, client, test_user):
        resp = client.post(
            "/api/v1/auth/login",
            data={"username": "test@gainn.ai", "password": "Test@123"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user):
        resp = client.post(
            "/api/v1/auth/login",
            data={"username": "test@gainn.ai", "password": "Wrong@123"},
        )
        assert resp.status_code in (400, 401)

    def test_login_nonexistent_user(self, client):
        resp = client.post(
            "/api/v1/auth/login",
            data={"username": "nobody@gainn.ai", "password": "Test@123"},
        )
        assert resp.status_code in (400, 401)


class TestProfile:
    def test_get_profile_authenticated(self, client, auth_headers):
        resp = client.get("/api/v1/auth/me", headers=auth_headers)
        assert resp.status_code == 200

    def test_get_profile_unauthenticated(self, client):
        resp = client.get("/api/v1/auth/me")
        assert resp.status_code in (401, 403)
