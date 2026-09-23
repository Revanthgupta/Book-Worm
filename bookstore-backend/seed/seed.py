"""Idempotent seed entry point.

Run from bookstore-backend/:
    python -m seed.seed
"""
import sys
import os

# Allow `python -m seed.seed` from the bookstore-backend/ directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from seed.categories import seed_categories
from seed.authors import seed_authors
from seed.books import seed_books
from seed.users import seed_users, seed_coupons


def run() -> None:
    db = SessionLocal()
    try:
        print("[seed] Starting seed...")
        seed_categories(db)
        seed_authors(db)
        seed_books(db)
        seed_coupons(db)
        seed_users(db)
        print("[seed] Done.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
