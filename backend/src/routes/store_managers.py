from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.store_manager import StoreManager
from src.routes.utils import apply_update, require_non_empty
from src.schemas import StoreManagerIn, StoreManagerOut, StoreManagerUpdate

router = APIRouter(prefix="/api/v1/store-managers", tags=["store-managers"])


def _get_or_404(db: Session, manager_id: int) -> StoreManager:
    manager = db.get(StoreManager, manager_id)
    if manager is None:
        raise HTTPException(404, "Store manager not found")
    return manager


@router.get("", response_model=list[StoreManagerOut])
def list_store_managers(db: Session = Depends(get_db)):
    return db.scalars(select(StoreManager).order_by(StoreManager.id)).all()


@router.post("", response_model=StoreManagerOut, status_code=201)
def create_store_manager(
    payload: StoreManagerIn, db: Session = Depends(get_db)
):
    require_non_empty(payload, "name", "email")
    manager = StoreManager(**payload.model_dump())
    db.add(manager)
    db.commit()
    return manager


@router.get("/{manager_id}", response_model=StoreManagerOut)
def get_store_manager(manager_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, manager_id)


@router.put("/{manager_id}", response_model=StoreManagerOut)
def update_store_manager(
    manager_id: int,
    payload: StoreManagerUpdate,
    db: Session = Depends(get_db),
):
    manager = _get_or_404(db, manager_id)
    apply_update(manager, payload, required=("name", "email"))
    db.commit()
    return manager


@router.delete("/{manager_id}", status_code=204)
def delete_store_manager(manager_id: int, db: Session = Depends(get_db)):
    db.delete(_get_or_404(db, manager_id))
    db.commit()
    return Response(status_code=204)
