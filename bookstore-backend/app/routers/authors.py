from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.author import Author
from app.schemas.book import AuthorResponse, BookResponse
from app.services import book_service
from app.services.serialisers import book_to_response

router = APIRouter(prefix="/api/authors", tags=["authors"])


@router.get("", response_model=list[AuthorResponse])
def list_authors(db: Session = Depends(get_db)):
    authors = db.query(Author).order_by(Author.name).all()
    return [AuthorResponse(id=a.id, name=a.name, photo=a.photo, bio=a.bio) for a in authors]


@router.get("/{author_id}", response_model=AuthorResponse)
def get_author(author_id: str, db: Session = Depends(get_db)):
    author = db.get(Author, author_id)
    if not author:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Author not found")
    return AuthorResponse(id=author.id, name=author.name, photo=author.photo, bio=author.bio)


@router.get("/{author_id}/books", response_model=list[BookResponse])
def books_by_author(author_id: str, db: Session = Depends(get_db)):
    author = db.get(Author, author_id)
    if not author:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Author not found")
    return [book_to_response(b) for b in book_service.get_books_by_author(db, author_id)]
