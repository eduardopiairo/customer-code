from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict


def _strip(value):
    return value.strip() if isinstance(value, str) else value


def _blank_to_none(value):
    value = _strip(value)
    return value or None


# required text: stripped, must not be empty
Text = Annotated[str, BeforeValidator(_strip)]
# optional text: stripped, blank becomes None
OptText = Annotated[str | None, BeforeValidator(_blank_to_none)]


class _Out(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class StoreIn(BaseModel):
    name: Text
    address: Text
    phone: OptText = None
    email: OptText = None


class StoreUpdate(BaseModel):
    name: Text | None = None
    address: Text | None = None
    phone: OptText = None
    email: OptText = None


class StoreOut(_Out):
    id: int
    name: str
    address: str
    phone: str | None
    email: str | None
    manager_id: int | None
    created_at: datetime
    updated_at: datetime


class StoreManagerIn(BaseModel):
    name: Text
    email: Text
    phone: OptText = None


class StoreManagerUpdate(BaseModel):
    name: Text | None = None
    email: Text | None = None
    phone: OptText = None


class StoreManagerOut(_Out):
    id: int
    name: str
    email: str
    phone: str | None
    created_at: datetime
    updated_at: datetime
