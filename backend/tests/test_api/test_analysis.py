"""Tests for analysis endpoints."""


class TestCreateAnalysis:
    def test_create_analysis_unauthenticated(self, client, sample_land_data):
        resp = client.post("/api/v1/analyses/", json=sample_land_data)
        assert resp.status_code in (401, 403)

    def test_create_analysis_missing_fields(self, client, auth_headers):
        resp = client.post("/api/v1/analyses/", headers=auth_headers, json={})
        assert resp.status_code == 422


class TestListAnalyses:
    def test_list_analyses(self, client, auth_headers):
        resp = client.get("/api/v1/analyses/", headers=auth_headers)
        assert resp.status_code == 200


class TestGetAnalysis:
    def test_get_nonexistent(self, client, auth_headers):
        resp = client.get("/api/v1/analyses/99999", headers=auth_headers)
        assert resp.status_code == 404


class TestSimulation:
    def test_simulate_nonexistent(self, client, auth_headers):
        resp = client.post(
            "/api/v1/analyses/99999/simulate",
            headers=auth_headers,
            json={"temp_change": 2, "rainfall_change": -10},
        )
        assert resp.status_code == 404
