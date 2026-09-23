"""Checkout router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.checkout import CheckoutRequest, CheckoutResponse
from app.services import checkout_service

router = APIRouter(prefix="/api/checkout", tags=["checkout"])


@router.post("", response_model=CheckoutResponse)
def checkout(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return checkout_service.execute(db, current_user.id, body)
