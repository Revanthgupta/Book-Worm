"""Book service — all catalogue query logic.

Every function returns plain SQLAlchemy ORM objects; the router is
responsible for serialisation via the Pydantic schemas.
"""
from __future__ import annotations

from typing import Literal

from sqlalchemy import or_, func
from sqlalchemy.orm import Session, joinedload

from app.models.author import Author
from app.models.book import Book
from app.models.book_category import BookCategory
from app.models.category import Category
from app.models.order import Order
from app.models.order_item import OrderItem


# ── Helpers ───────────────────────────────────────────────────────────────────

def _base_query(db: Session):
    """Return a query with author eagerly loaded."""
    return db.query(Book).options(
        joinedload(Book.author),
        joinedload(Book.book_categories).joinedload(BookCategory.category),
    )


def _book_categories(book: Book) -> list[str]:
    """Extract category name list from ORM object."""
    return [bc.category.name for bc in book.book_categories if bc.category]


def _author_name(book: Book) -> str:
    return book.author.name if book.author else ""


# ── Public API ────────────────────────────────────────────────────────────────

SortBy = Literal["relevance", "price_asc", "price_desc", "rating_desc"]

PRICE_RANGES = {
    "Under ₹200": (0, 200),
    "₹200–₹400": (200, 400),
    "Above ₹400": (400, None),
}


def list_books(
    db: Session,
    *,
    q: str | None = None,
    category: str | None = None,
    language: str | None = None,
    format_: str | None = None,
    price_min: float | None = None,
    price_max: float | None = None,
    sort_by: SortBy = "relevance",
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Book], int]:
    """Return (books, total_count) applying all filters."""
    query = _base_query(db)

    if q:
        term = f"%{q.lower()}%"
        query = query.filter(
            or_(
                func.lower(Book.title).like(term),
                func.lower(Author.name).like(term),
            )
        ).join(Author, Book.author_id == Author.id)

    if category:
        query = (
            query
            .join(BookCategory, Book.id == BookCategory.book_id)
            .join(Category, BookCategory.category_id == Category.id)
            .filter(Category.name == category)
        )

    if language:
        query = query.filter(Book.language == language)

    if format_:
        query = query.filter(Book.format == format_)

    if price_min is not None:
        query = query.filter(Book.price >= price_min)

    if price_max is not None:
        query = query.filter(Book.price <= price_max)

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Book.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Book.price.desc())
    elif sort_by == "rating_desc":
        query = query.order_by(Book.rating.desc().nulls_last())
    else:
        # relevance: bestsellers first, then featured, then by sells desc
        query = query.order_by(Book.sells.desc())

    total = query.count()
    books = query.offset((page - 1) * page_size).limit(page_size).all()
    return books, total


def get_book_by_isbn(db: Session, isbn: str) -> Book | None:
    return _base_query(db).filter(Book.id == isbn).first()


def get_related_books(db: Session, book: Book, limit: int = 3) -> list[Book]:
    """Return up to *limit* books that share at least one category, excluding *book* itself."""
    cat_ids = [bc.category_id for bc in book.book_categories]
    if not cat_ids:
        return []
    return (
        _base_query(db)
        .join(BookCategory, Book.id == BookCategory.book_id)
        .filter(BookCategory.category_id.in_(cat_ids))
        .filter(Book.id != book.id)
        .order_by(Book.sells.desc())
        .limit(limit)
        .all()
    )


def get_featured(db: Session) -> list[Book]:
    return _base_query(db).filter(Book.featured.is_(True)).order_by(Book.sells.desc()).all()


def get_bestsellers(db: Session) -> list[Book]:
    return _base_query(db).filter(Book.bestseller.is_(True)).order_by(Book.sells.desc()).all()


def get_new_launches(db: Session) -> list[Book]:
    return _base_query(db).filter(Book.new_launch.is_(True)).order_by(Book.sells.desc()).all()


def get_recommendations(db: Session, user_id: str, limit: int = 10) -> list[Book]:
    """Return books based on the user's order history.

    Strategy:
    1. Collect category ids from the user's past order items (via book FK).
    2. Return books in those categories that the user has NOT purchased before.
    3. Fall back to featured books when no history exists.
    """
    # Step 1: ISBNs the user has already bought
    purchased_isbns: list[str] = (
        db.query(OrderItem.book_id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(Order.user_id == user_id, Order.status != "Cancelled")
        .filter(OrderItem.book_id.isnot(None))
        .distinct()
        .all()
    )
    purchased_isbns = [row[0] for row in purchased_isbns]

    if not purchased_isbns:
        # No history → return featured books
        return get_featured(db)[:limit]

    # Step 2: Category ids from purchased books
    cat_ids: list[int] = (
        db.query(BookCategory.category_id)
        .filter(BookCategory.book_id.in_(purchased_isbns))
        .distinct()
        .all()
    )
    cat_ids = [row[0] for row in cat_ids]

    if not cat_ids:
        return get_featured(db)[:limit]

    # Step 3: Books in those categories, not yet purchased
    return (
        _base_query(db)
        .join(BookCategory, Book.id == BookCategory.book_id)
        .filter(BookCategory.category_id.in_(cat_ids))
        .filter(Book.id.notin_(purchased_isbns))
        .order_by(Book.rating.desc().nulls_last())
        .limit(limit)
        .all()
    )


def get_books_by_category(db: Session, category_id: int) -> list[Book]:
    """Return all books for a given category id."""
    return (
        _base_query(db)
        .join(BookCategory, Book.id == BookCategory.book_id)
        .filter(BookCategory.category_id == category_id)
        .order_by(Book.sells.desc())
        .all()
    )


def get_books_by_author(db: Session, author_id: str) -> list[Book]:
    return _base_query(db).filter(Book.author_id == author_id).order_by(Book.sells.desc()).all()
