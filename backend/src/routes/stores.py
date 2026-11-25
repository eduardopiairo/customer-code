from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.store import Store
from src.routes.utils import apply_update, require_non_empty
from src.schemas import StoreIn, StoreOut, StoreUpdate

router = APIRouter(prefix="/api/v1/stores", tags=["stores"])


def _get_or_404(db: Session, store_id: int) -> Store:
    store = db.get(Store, store_id)
    if store is None:
        raise HTTPException(404, "Store not found")
    return store


@router.get("", response_model=list[StoreOut])
def list_stores(db: Session = Depends(get_db)):
    return db.scalars(select(Store).order_by(Store.id)).all()


@router.post("", response_model=StoreOut, status_code=201)
def create_store(payload: StoreIn, db: Session = Depends(get_db)):
    require_non_empty(payload, "name", "address")
    store = Store(**payload.model_dump())
    db.add(store)
    db.commit()
    return store


@router.get("/{store_id}", response_model=StoreOut)
def get_store(store_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, store_id)


@router.put("/{store_id}", response_model=StoreOut)
def update_store(
    store_id: int, payload: StoreUpdate, db: Session = Depends(get_db)
):
    store = _get_or_404(db, store_id)
    apply_update(store, payload, required=("name", "address"))
    db.commit()
    return store


@router.delete("/{store_id}", status_code=204)
def delete_store(store_id: int, db: Session = Depends(get_db)):
    db.delete(_get_or_404(db, store_id))
    db.commit()
    return Response(status_code=204)
