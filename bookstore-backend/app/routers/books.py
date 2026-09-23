"""Books router.

IMPORTANT: static sub-paths (/featured, /bestsellers, /new-launches, /recommended)
are registered BEFORE the dynamic /{isbn} route so FastAPI matches them first.
"""
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.book import BookListResponse, BookResponse
from app.schemas.review import ReviewRequest, ReviewResponse
from app.services import book_service, review_service
from app.services.serialisers import book_to_response

router = APIRouter(prefix="/api/books", tags=["books"])


# ── Static list endpoints (must come before /{isbn}) ─────────────────────────

@router.get("/featured", response_model=list[BookResponse])
def featured(db: Session = Depends(get_db)):
    return [book_to_response(b) for b in book_service.get_featured(db)]


@router.get("/bestsellers", response_model=list[BookResponse])
def bestsellers(db: Session = Depends(get_db)):
    return [book_to_response(b) for b in book_service.get_bestsellers(db)]


@router.get("/new-launches", response_model=list[BookResponse])
def new_launches(db: Session = Depends(get_db)):
    return [book_to_response(b) for b in book_service.get_new_launches(db)]


@router.get("/recommended", response_model=list[BookResponse])
def recommended(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return personalised recommendations (requires authentication)."""
    books = book_service.get_recommendations(db, current_user.id)
    return [book_to_response(b) for b in books]


# ── Catalogue list with filters ───────────────────────────────────────────────

@router.get("", response_model=BookListResponse)
def list_books(
    q: str | None = Query(default=None, description="Full-text search on title/author"),
    category: str | None = Query(default=None),
    language: str | None = Query(default=None),
    format: str | None = Query(default=None, alias="format"),
    price_min: float | None = Query(default=None, ge=0),
    price_max: float | None = Query(default=None, ge=0),
    sort_by: Literal["relevance", "price_asc", "price_desc", "rating_desc"] = Query(
        default="relevance"
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    books, total = book_service.list_books(
        db,
        q=q,
        category=category,
        language=language,
        format_=format,
        price_min=price_min,
        price_max=price_max,
        sort_by=sort_by,
        page=page,
        page_size=page_size,
    )
    import math
    return BookListResponse(
        items=[book_to_response(b) for b in books],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )


# ── Single book — dynamic route last ─────────────────────────────────────────

@router.get("/{isbn}", response_model=BookResponse)
def get_book(isbn: str, db: Session = Depends(get_db)):
    book = book_service.get_book_by_isbn(db, isbn)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return book_to_response(book)


@router.get("/{isbn}/related", response_model=list[BookResponse])
def related_books(isbn: str, db: Session = Depends(get_db)):
    book = book_service.get_book_by_isbn(db, isbn)
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    return [book_to_response(b) for b in book_service.get_related_books(db, book)]


# ── Reviews ───────────────────────────────────────────────────────────────────

@router.get("/{isbn}/reviews", response_model=list[ReviewResponse])
def list_reviews(isbn: str, db: Session = Depends(get_db)):
    return review_service.list_reviews(db, isbn)


@router.post("/{isbn}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    isbn: str,
    body: ReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return review_service.create_review(db, current_user.id, current_user.name, isbn, body)
