from fastapi import HTTPException
from pydantic import BaseModel


def require_non_empty(payload: BaseModel, *fields: str) -> None:
    missing = [f for f in fields if not getattr(payload, f)]
    if missing:
        names = " and ".join(f"'{f}'" for f in missing)
        raise HTTPException(
            422, f"Field(s) {names} are required and cannot be empty"
        )


def apply_update(obj, payload: BaseModel, required: tuple[str, ...]) -> None:
    """Apply only the fields the client sent (PATCH-like PUT semantics)."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field in required and not value:
            raise HTTPException(422, f"'{field}' cannot be empty")
        setattr(obj, field, value)
