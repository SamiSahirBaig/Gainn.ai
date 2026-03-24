"""Tests for land CRUD endpoints."""


class TestCreateLand:
    def test_create_land(self, client, auth_headers):
        resp = client.post(
            "/api/v1/lands/",
            headers=auth_headers,
            json={
                "name": "Test Farm",
                "latitude": 17.385,
                "longitude": 78.487,
                "size": 5.0,
                "soil_type": "loamy",
                "soil_ph": 6.5,
            },
        )
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert data.get("data", data).get("name") == "Test Farm"

    def test_create_land_unauthenticated(self, client):
        resp = client.post("/api/v1/lands/", json={"name": "No Auth"})
        assert resp.status_code in (401, 403)


class TestListLands:
    def test_list_empty(self, client, auth_headers):
        resp = client.get("/api/v1/lands/", headers=auth_headers)
        assert resp.status_code == 200


class TestGetLand:
    def test_get_nonexistent(self, client, auth_headers):
        resp = client.get("/api/v1/lands/99999", headers=auth_headers)
        assert resp.status_code == 404
