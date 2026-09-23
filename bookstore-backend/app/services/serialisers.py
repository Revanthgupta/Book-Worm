"""Shared ORM → Pydantic serialisation helpers for books."""
from app.models.book import Book
from app.schemas.book import BookResponse, delivery_date_string


def book_to_response(book: Book) -> BookResponse:
    """Convert a Book ORM row (with author + categories eagerly loaded) to BookResponse."""
    categories = [bc.category.name for bc in book.book_categories if bc.category]
    return BookResponse(
        id=book.id,
        title=book.title,
        author_id=book.author_id,
        author_name=book.author.name if book.author else "",
        publisher=book.publisher,
        format=book.format,
        categories=categories,
        price=float(book.price),
        cover_image=book.cover_image,
        synopsis=book.synopsis,
        back_cover_text=book.back_cover_text,
        language=book.language,
        rating=float(book.rating) if book.rating is not None else None,
        sells=book.sells or 0,
        delivery_date=delivery_date_string(),
        featured=bool(book.featured),
        bestseller=bool(book.bestseller),
        new_launch=bool(book.new_launch),
    )
