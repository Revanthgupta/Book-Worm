"""Wishlist service — add, remove, list with user isolation."""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.wishlist import Wishlist
from app.schemas.wishlist import WishlistItemResponse


def list_wishlist(db: Session, user_id: str) -> list[WishlistItemResponse]:
    items = (
        db.query(Wishlist)
        .options(joinedload(Wishlist.book).joinedload(
            __import__("app.models.book", fromlist=["Book"]).Book.author
        ))
        .filter(Wishlist.user_id == user_id)
        .order_by(Wishlist.added_at)
        .all()
    )
    result = []
    for item in items:
        b = item.book
        result.append(WishlistItemResponse(
            book_id=b.id,
            title=b.title,
            cover_image=b.cover_image,
            price=float(b.price),
            author_name=b.author.name if b.author else "",
        ))
    return result


def add_to_wishlist(db: Session, user_id: str, isbn: str) -> WishlistItemResponse:
    from app.models.book import Book  # local import

    book = db.get(Book, isbn)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")

    existing = db.get(Wishlist, (user_id, isbn))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Book already in wishlist")

    db.add(Wishlist(user_id=user_id, book_id=isbn))
    db.commit()

    # Reload with author
    book = db.query(Book).filter(Book.id == isbn).first()
    return WishlistItemResponse(
        book_id=book.id,
        title=book.title,
        cover_image=book.cover_image,
        price=float(book.price),
        author_name=book.author.name if book.author else "",
    )


def remove_from_wishlist(db: Session, user_id: str, isbn: str) -> None:
    item = db.get(Wishlist, (user_id, isbn))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not in wishlist")
    db.delete(item)
    db.commit()
