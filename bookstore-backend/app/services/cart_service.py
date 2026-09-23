"""Cart service — upsert, remove, clear, coupon, and total calculation."""
import uuid
from math import floor

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.coupon import Coupon
from app.schemas.cart import CartItemResponse, CartResponse


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_or_create_cart(db: Session, user_id: str) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if cart is None:
        cart = Cart(id=str(uuid.uuid4()), user_id=user_id)
        db.add(cart)
        db.flush()
    return cart


def _calculate_totals(cart: Cart) -> CartResponse:
    items_out: list[CartItemResponse] = []
    subtotal: float = 0.0

    for item in cart.items:
        book = item.book
        price = float(book.price)
        line_total = round(price * item.quantity, 2)
        subtotal += line_total
        items_out.append(CartItemResponse(
            book_id=book.id,
            title=book.title,
            cover_image=book.cover_image,
            price=price,
            quantity=item.quantity,
            line_total=line_total,
        ))

    subtotal = round(subtotal, 2)
    tax = round(subtotal * 0.12)  # integer rupees — matches frontend selectCartTax

    discount: float = 0.0
    coupon_code = cart.coupon_code
    if cart.coupon and cart.coupon.is_active:
        raw_discount = float(cart.coupon.discount_amount)
        # Discount cannot exceed subtotal + tax
        discount = min(raw_discount, subtotal + tax)
        discount = round(discount, 2)

    total = max(0.0, round(subtotal + tax - discount, 2))

    return CartResponse(
        items=items_out,
        coupon_code=coupon_code,
        discount=discount,
        subtotal=subtotal,
        tax=float(tax),
        total=total,
    )


def _load_cart(db: Session, user_id: str) -> Cart:
    """Load cart with all required join-loaded relationships."""
    cart = (
        db.query(Cart)
        .options(
            joinedload(Cart.items).joinedload(CartItem.book),
            joinedload(Cart.coupon),
        )
        .filter(Cart.user_id == user_id)
        .first()
    )
    if cart is None:
        # Return empty cart response without persisting a row
        return None
    return cart


# ── Public API ────────────────────────────────────────────────────────────────

def get_cart(db: Session, user_id: str) -> CartResponse:
    cart = _load_cart(db, user_id)
    if cart is None:
        return CartResponse(items=[], coupon_code=None, discount=0.0, subtotal=0.0, tax=0.0, total=0.0)
    return _calculate_totals(cart)


def upsert_item(db: Session, user_id: str, isbn: str, quantity: int) -> CartResponse:
    from app.models.book import Book  # local import to avoid circulars

    book = db.get(Book, isbn)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    cart = _get_or_create_cart(db, user_id)

    existing = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.book_id == isbn)
        .first()
    )
    if existing:
        existing.quantity = quantity
    else:
        db.add(CartItem(id=str(uuid.uuid4()), cart_id=cart.id, book_id=isbn, quantity=quantity))

    db.commit()
    return get_cart(db, user_id)


def remove_item(db: Session, user_id: str, isbn: str) -> CartResponse:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if cart is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")

    item = (
        db.query(CartItem)
        .filter(CartItem.cart_id == cart.id, CartItem.book_id == isbn)
        .first()
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")

    db.delete(item)
    db.commit()
    return get_cart(db, user_id)


def clear_cart(db: Session, user_id: str) -> CartResponse:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if cart:
        for item in list(cart.items):
            db.delete(item)
        cart.coupon_code = None
        db.commit()
    return CartResponse(items=[], coupon_code=None, discount=0.0, subtotal=0.0, tax=0.0, total=0.0)


def apply_coupon(db: Session, user_id: str, code: str) -> CartResponse:
    coupon = db.get(Coupon, code.upper())
    if coupon is None or not coupon.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or inactive coupon code")

    cart = _get_or_create_cart(db, user_id)
    cart.coupon_code = coupon.code
    db.commit()
    return get_cart(db, user_id)


def remove_coupon(db: Session, user_id: str) -> CartResponse:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if cart:
        cart.coupon_code = None
        db.commit()
    return get_cart(db, user_id)
