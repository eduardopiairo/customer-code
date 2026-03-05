def test_health_returns_200(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_returns_healthy_status(client):
    response = client.get("/api/v1/health")
    assert response.get_json() == {"status": "healthy"}


def test_details_returns_200(client):
    response = client.get("/api/v1/details")
    assert response.status_code == 200


def test_details_returns_expected_fields(client):
    data = client.get("/api/v1/details").get_json()
    assert data["name"] == "customer-code-api"
    assert data["version"] == "1.0.0"
    assert "time" in data
    assert "hostname" in data
