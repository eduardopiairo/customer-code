import os
import secrets
from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.user import User

ALGORITHM = "HS256"
TOKEN_TTL = timedelta(hours=int(os.environ.get("TOKEN_TTL_HOURS", "8")))

_hasher = PasswordHasher()
_bearer = HTTPBearer(auto_error=False)
_ephemeral_key = secrets.token_urlsafe(32)


def _secret() -> str:
    key = os.environ.get("JWT_SECRET_KEY")
    if key:
        return key
    if os.environ.get("DATABASE_URL", "sqlite").startswith("sqlite"):
        # dev/tests only: tokens stop working when the process restarts
        return _ephemeral_key
    raise RuntimeError("JWT_SECRET_KEY must be set when using a real database")


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


# Used to keep login timing similar when the e-mail doesn't exist.
_DUMMY_HASH = _hasher.hash(secrets.token_urlsafe(8))


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == email.lower()))
    if user is None:
        verify_password(password, _DUMMY_HASH)
        return None
    return user if verify_password(password, user.password_hash) else None


def create_token(user: User) -> str:
    now = datetime.now(UTC)
    payload = {"sub": str(user.id), "iat": now, "exp": now + TOKEN_TTL}
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        401, "Not authenticated", headers={"WWW-Authenticate": "Bearer"}
    )
    if creds is None:
        raise unauthorized
    try:
        payload = jwt.decode(
            creds.credentials, _secret(), algorithms=[ALGORITHM]
        )
        user = db.get(User, int(payload["sub"]))
    except (jwt.PyJWTError, KeyError, ValueError):
        raise unauthorized from None
    if user is None:
        raise unauthorized
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(403, "Administrator access required")
    return user
