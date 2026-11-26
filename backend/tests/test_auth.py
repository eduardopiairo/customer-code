EMAIL = "admin@example.com"
PASSWORD = "correct-horse-battery"


def login(client, email=EMAIL, password=PASSWORD):
    return client.post(
        "/api/v1/auth/login", json={"email": email, "password": password}
    )


def test_login_success_returns_token(anon_client):
    r = login(anon_client)
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"
    assert r.json()["access_token"]


def test_login_email_is_case_insensitive(anon_client):
    assert login(anon_client, email="ADMIN@Example.com").status_code == 200


def test_login_wrong_password(anon_client):
    r = login(anon_client, password="nope-nope-nope")
    assert r.status_code == 401
    assert "error" in r.json()


def test_login_unknown_user(anon_client):
    assert login(anon_client, email="who@example.com").status_code == 401


def test_me_with_token(anon_client):
    token = login(anon_client).json()["access_token"]
    r = anon_client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    assert r.json()["email"] == EMAIL
    assert "password" not in r.text


def test_protected_routes_require_token(anon_client):
    paths = ("/api/v1/stores", "/api/v1/store-managers", "/api/v1/auth/me")
    for path in paths:
        r = anon_client.get(path)
        assert r.status_code == 401, path
        assert r.headers["www-authenticate"] == "Bearer"


def test_invalid_token_rejected(anon_client):
    r = anon_client.get(
        "/api/v1/stores", headers={"Authorization": "Bearer garbage"}
    )
    assert r.status_code == 401


def test_health_stays_public(anon_client):
    assert anon_client.get("/api/v1/health").status_code == 200


def test_create_user_requires_auth(anon_client):
    r = anon_client.post(
        "/api/v1/users",
        json={"email": "new@example.com", "password": "a-long-password"},
    )
    assert r.status_code == 401


def test_create_user_and_login(client):
    r = client.post(
        "/api/v1/users",
        json={"email": "New@Example.com", "password": "a-long-password"},
    )
    assert r.status_code == 201
    assert r.json()["email"] == "new@example.com"
    r = login(client, "new@example.com", "a-long-password")
    assert r.status_code == 200


def test_create_user_duplicate_and_short_password(client):
    dup = client.post(
        "/api/v1/users", json={"email": EMAIL, "password": "a-long-password"}
    )
    assert dup.status_code == 409
    short = client.post(
        "/api/v1/users", json={"email": "x@example.com", "password": "short"}
    )
    assert short.status_code == 422
