import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from src.app import create_app
from src.database import Base, get_db, make_engine


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
