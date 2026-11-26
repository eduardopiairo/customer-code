import os

# Must run before importing src.*: tests never touch a real database,
# even if backend/.env defines DATABASE_URL (load_dotenv doesn't override).
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
for _var in ("ADMIN_EMAIL", "ADMIN_PASSWORD", "JWT_SECRET_KEY"):
    os.environ.pop(_var, None)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from src.app import create_app  # noqa: E402
from src.database import Base, get_db, make_engine  # noqa: E402
from src.models.user import User  # noqa: E402
from src.security import create_token, hash_password  # noqa: E402


@pytest.fixture
def anon_client():
    """Client without credentials."""
    engine = make_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)

    with Session() as session:
        session.add(
            User(
                email="admin@example.com",
                password_hash=hash_password("correct-horse-battery"),
            )
        )
        session.commit()

    def override_get_db():
        with Session() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        c.session_factory = Session
        yield c


@pytest.fixture
def client(anon_client):
    """Client already authenticated as the seeded user."""
    with anon_client.session_factory() as session:
        user = session.query(User).first()
        token = create_token(user)
    anon_client.headers["Authorization"] = f"Bearer {token}"
    return anon_client
