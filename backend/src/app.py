import socket
from contextlib import asynccontextmanager
from datetime import UTC, datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from src import models  # noqa: F401  (registers tables on Base.metadata)
from src.database import Base, engine
from src.routes import store_managers_router, stores_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Customer Code API", version="1.0.0", lifespan=lifespan
    )

    # Keep the {"error": ...} response shape the frontend relies on.
    @app.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException):
        return JSONResponse({"error": exc.detail}, status_code=exc.status_code)

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

    app.include_router(stores_router)
    app.include_router(store_managers_router)

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
