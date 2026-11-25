import os

# Must run before importing src.*: tests never touch a real database,
# even if backend/.env defines DATABASE_URL (load_dotenv doesn't override).
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from src.app import create_app  # noqa: E402
from src.database import Base, get_db, make_engine  # noqa: E402


@pytest.fixture
def client():
    engine = make_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, expire_on_commit=False)

    def override_get_db():
        with Session() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
