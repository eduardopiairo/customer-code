import os
from collections.abc import Iterator

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Load backend/.env for local runs. Real environment variables win
# (override=False), and nothing happens if the file doesn't exist.
load_dotenv()


class Base(DeclarativeBase):
    pass


def make_engine(url: str):
    if url.startswith("sqlite"):
        # in-memory SQLite needs a single shared connection
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
    return create_engine(url, pool_pre_ping=True)


def _database_url() -> str:
    url = os.environ.get("DATABASE_URL", "sqlite:///:memory:")
    # normalise every Postgres flavour to the psycopg (v3) driver
    for prefix in ("postgres://", "postgresql://", "postgresql+psycopg2://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


engine = make_engine(_database_url())
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session


def upgrade_schema(eng=None) -> None:
    """Small in-place upgrades for tables created by older versions.

    ``create_all`` never alters existing tables, so columns added later are
    applied here. Idempotent; safe to run on every start.
    """
    eng = eng or engine
    insp = inspect(eng)
    if "users" not in insp.get_table_names():
        return
    cols = {c["name"] for c in insp.get_columns("users")}
    with eng.begin() as conn:
        if "is_admin" not in cols:
            conn.execute(
                text(
                    "ALTER TABLE users ADD COLUMN is_admin BOOLEAN "
                    "NOT NULL DEFAULT FALSE"
                )
            )
