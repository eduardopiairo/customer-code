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


def test_me_reports_admin_flag(client):
    assert client.get("/api/v1/auth/me").json()["is_admin"] is True


def test_non_admin_cannot_manage_users(member_client):
    assert member_client.get("/api/v1/users").status_code == 403
    r = member_client.post(
        "/api/v1/users",
        json={"email": "z@example.com", "password": "a-long-password"},
    )
    assert r.status_code == 403
    assert member_client.delete("/api/v1/users/1").status_code == 403
    # but normal data access still works
    assert member_client.get("/api/v1/stores").status_code == 200


def test_admin_lists_users_without_hashes(client):
    r = client.get("/api/v1/users")
    assert r.status_code == 200
    assert len(r.json()) == 2
    assert "password" not in r.text


def test_admin_can_create_another_admin(client):
    r = client.post(
        "/api/v1/users",
        json={
            "email": "boss@example.com",
            "password": "a-long-password",
            "is_admin": True,
        },
    )
    assert r.status_code == 201
    assert r.json()["is_admin"] is True


def _id_by_email(client, **kw):
    users = client.get("/api/v1/users", **kw).json()
    return {u["email"]: u["id"] for u in users}


def test_admin_deletes_user_but_not_self(client):
    ids = _id_by_email(client)
    assert client.delete(f"/api/v1/users/{ids[EMAIL]}").status_code == 409
    member = ids["member@example.com"]
    assert client.delete(f"/api/v1/users/{member}").status_code == 204
    assert client.delete("/api/v1/users/9999").status_code == 404


def test_cannot_delete_last_admin(client):
    client.post(
        "/api/v1/users",
        json={
            "email": "b@example.com",
            "password": "a-long-password",
            "is_admin": True,
        },
    )
    token = login(client, "b@example.com", "a-long-password").json()[
        "access_token"
    ]
    h = {"Authorization": f"Bearer {token}"}
    ids = _id_by_email(client, headers=h)
    # two admins: deleting the original one is allowed
    url = "/api/v1/users/{}".format
    first = client.delete(url(ids[EMAIL]), headers=h)
    assert first.status_code == 204
    # now b is the only admin (and it's themselves)
    last = client.delete(url(ids["b@example.com"]), headers=h)
    assert last.status_code == 409
