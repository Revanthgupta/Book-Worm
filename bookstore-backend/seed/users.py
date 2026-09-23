"""Seed demo users and coupons."""
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.coupon import Coupon
from app.models.user import User

DEMO_USERS = [
    {"id": "u1", "name": "Priya Sharma",  "email": "priya@bookworm.com",  "password": "password123"},
    {"id": "u2", "name": "Rahul Mehta",   "email": "rahul@bookworm.com",  "password": "password123"},
    {"id": "u3", "name": "Ananya Singh",  "email": "ananya@bookworm.com", "password": "password123"},
]

COUPONS = [
    {"code": "BOOK10",  "discount_amount": 10},
    {"code": "SAVE50",  "discount_amount": 50},
    {"code": "READ100", "discount_amount": 100},
    {"code": "WORM20",  "discount_amount": 20},
]


def seed_users(db: Session) -> None:
    for u in DEMO_USERS:
        if not db.get(User, u["id"]):
            db.add(User(
                id=u["id"],
                name=u["name"],
                email=u["email"],
                hashed_password=hash_password(u["password"]),
            ))
    db.commit()
    print(f"[seed] users: {len(DEMO_USERS)} seeded")


def seed_coupons(db: Session) -> None:
    for c in COUPONS:
        if not db.get(Coupon, c["code"]):
            db.add(Coupon(code=c["code"], discount_amount=c["discount_amount"]))
    db.commit()
    print(f"[seed] coupons: {len(COUPONS)} seeded")
