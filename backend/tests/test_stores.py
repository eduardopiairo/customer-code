import pytest


@pytest.fixture
def store_payload():
    return {"name": "Test Store", "address": "123 Main St"}


def test_list_stores_empty(client):
    response = client.get("/api/v1/stores")
    assert response.status_code == 200
    assert response.get_json() == []


def test_create_store(client, store_payload):
    response = client.post("/api/v1/stores", json=store_payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == store_payload["name"]
    assert data["address"] == store_payload["address"]
    assert "id" in data


def test_create_store_missing_fields(client):
    response = client.post("/api/v1/stores", json={"name": "Only Name"})
    assert response.status_code == 422


def test_create_store_invalid_json(client):
    response = client.post(
        "/api/v1/stores",
        data="not json",
        content_type="text/plain",
    )
    assert response.status_code == 400


def test_get_store(client, store_payload):
    created = client.post("/api/v1/stores", json=store_payload).get_json()
    response = client.get(f"/api/v1/stores/{created['id']}")
    assert response.status_code == 200
    assert response.get_json()["id"] == created["id"]


def test_get_store_not_found(client):
    response = client.get("/api/v1/stores/999")
    assert response.status_code == 404


def test_update_store(client, store_payload):
    created = client.post("/api/v1/stores", json=store_payload).get_json()
    response = client.put(
        f"/api/v1/stores/{created['id']}",
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.get_json()["name"] == "Updated Name"


def test_delete_store(client, store_payload):
    created = client.post("/api/v1/stores", json=store_payload).get_json()
    response = client.delete(f"/api/v1/stores/{created['id']}")
    assert response.status_code == 204
    assert client.get(f"/api/v1/stores/{created['id']}").status_code == 404
