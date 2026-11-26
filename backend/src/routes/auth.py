from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.user import User
from src.schemas import Text, UserOut
from src.security import (
    authenticate,
    create_token,
    get_current_user,
    hash_password,
    require_admin,
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
    is_admin: bool = False


@router.post("/auth/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = authenticate(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(401, "Invalid e-mail or password")
    return TokenOut(access_token=create_token(user))


@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db), _: User = Depends(require_admin)
):
    return db.scalars(select(User).order_by(User.id)).all()


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(
    payload: UserIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    email = payload.email.lower()
    if "@" not in email:
        raise HTTPException(422, "'email' must be a valid e-mail address")
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "A user with this e-mail already exists")
    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        is_admin=payload.is_admin,
    )
    db.add(user)
    db.commit()
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(404, "User not found")
    if user.id == admin.id:
        raise HTTPException(409, "You cannot delete your own account")
    if user.is_admin:
        admins = db.scalar(
            select(func.count()).select_from(User).where(User.is_admin)
        )
        if admins <= 1:
            raise HTTPException(409, "Cannot delete the last administrator")
    db.delete(user)
    db.commit()
    return Response(status_code=204)
