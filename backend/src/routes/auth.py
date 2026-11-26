from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.user import User
from src.schemas import Text, UserOut
from src.security import (
    authenticate,
    create_token,
    get_current_user,
    hash_password,
)

router = APIRouter(prefix="/api/v1", tags=["auth"])


class LoginIn(BaseModel):
    email: Text
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserIn(BaseModel):
    email: Text
    password: str = Field(min_length=10, max_length=128)


@router.post("/auth/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = authenticate(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(401, "Invalid e-mail or password")
    return TokenOut(access_token=create_token(user))


@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(
    payload: UserIn,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Any logged-in user can add another user (no public sign-up)."""
    email = payload.email.lower()
    if "@" not in email:
        raise HTTPException(422, "'email' must be a valid e-mail address")
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "A user with this e-mail already exists")
    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    return user
