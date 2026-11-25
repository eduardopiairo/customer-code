# Default entrypoint discovered by `fastapi run` / `fastapi deploy`.
from src.app import app

__all__ = ["app"]
