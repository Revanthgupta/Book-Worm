from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.category import Category
from app.schemas.book import BookResponse
from app.schemas.category import CategoryResponse
from app.services import book_service
from app.services.serialisers import book_to_response

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).order_by(Category.name).all()
    return [CategoryResponse(id=c.id, name=c.name) for c in cats]


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryResponse(id=cat.id, name=cat.name)


@router.get("/{category_id}/books", response_model=list[BookResponse])
def books_in_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return [book_to_response(b) for b in book_service.get_books_by_category(db, category_id)]
