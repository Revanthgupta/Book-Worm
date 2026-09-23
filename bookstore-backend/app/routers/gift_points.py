"""Gift points router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.services import gift_points_service

router = APIRouter(prefix="/api/gift-points", tags=["gift-points"])


@router.get("/balance")
def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"balance": gift_points_service.get_balance(db, current_user.id)}
