import os
import socket
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy import select

from src import models  # noqa: F401  (registers tables on Base.metadata)
from src.database import Base, SessionLocal, engine
from src.models.user import User
from src.routes import auth_router, store_managers_router, stores_router
from src.security import get_current_user, hash_password


def seed_first_user() -> None:
    """Create the first user from ADMIN_EMAIL/ADMIN_PASSWORD if none exist."""
    email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("ADMIN_PASSWORD", "")
    if not email or not password:
        return
    with SessionLocal() as db:
        if db.scalar(select(User.id).limit(1)) is None:
            db.add(User(email=email, password_hash=hash_password(password)))
            db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    seed_first_user()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Customer Code API", version="1.0.0", lifespan=lifespan
    )

    # Keep the {"error": ...} response shape the frontend relies on.
    @app.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException):
        return JSONResponse(
            {"error": exc.detail},
            status_code=exc.status_code,
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError):
        errors = exc.errors()
        body_errors = [e for e in errors if e["loc"][:1] == ("body",)]
        if body_errors and (
            body_errors[0]["type"] in {"json_invalid", "model_attributes_type"}
            or body_errors[0]["loc"] == ("body",)
            and body_errors[0]["type"] == "missing"
        ):
            return JSONResponse(
                {"error": "Request body must be JSON"}, status_code=400
            )
        fields = ", ".join(
            sorted({str(e["loc"][-1]) for e in errors if e["loc"]})
        )
        return JSONResponse(
            {"error": f"Invalid or missing field(s): {fields}"},
            status_code=422,
        )

    app.include_router(auth_router)
    protected = [Depends(get_current_user)]
    app.include_router(stores_router, dependencies=protected)
    app.include_router(store_managers_router, dependencies=protected)

    @app.get("/api/v1/health")
    def health():
        return {"status": "healthy"}

    @app.get("/api/v1/details")
    def details():
        return {
            "name": "customer-code-api",
            "version": "1.0.0",
            "description": "Customer Code API",
            "time": datetime.now(UTC).isoformat(),
            "hostname": socket.gethostname(),
        }

    return app


app = create_app()
