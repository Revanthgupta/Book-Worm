"""Cart router — all endpoints are authenticated."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.cart import CartItemRequest, CartResponse, CouponRequest
from app.services import cart_service

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cart_service.get_cart(db, current_user.id)


@router.put("/items/{isbn}", response_model=CartResponse, status_code=status.HTTP_200_OK)
def upsert_item(
    isbn: str,
    body: CartItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cart_service.upsert_item(db, current_user.id, isbn, body.quantity)


@router.delete("/items/{isbn}", response_model=CartResponse)
def remove_item(
    isbn: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cart_service.remove_item(db, current_user.id, isbn)


@router.delete("", response_model=CartResponse)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cart_service.clear_cart(db, current_user.id)


@router.post("/coupon", response_model=CartResponse)
def apply_coupon(
    body: CouponRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cart_service.apply_coupon(db, current_user.id, body.code)


@router.delete("/coupon", response_model=CartResponse)
def remove_coupon(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cart_service.remove_coupon(db, current_user.id)
