"""Seed categories — all 25 non-'All' values from src/types/book.ts"""
from sqlalchemy.orm import Session

from app.models.category import Category

CATEGORIES = [
    "Romance",
    "Mystery",
    "Science Fiction",
    "Fantasy",
    "Historical",
    "Biography",
    "Self Help",
    "Memoir",
    "Travel",
    "Cooking",
    "Children's",
    "Young Adult",
    "Comics & Graphic Novels",
    "Poetry",
    "Drama",
    "Science",
    "Philosophy",
    "Religion",
    "Language Learning",
    "Non-fiction",
    "Fiction",
    "Thriller",
    "Horror",
    "Love",
    "Business",
]


def seed_categories(db: Session) -> None:
    for name in CATEGORIES:
        if not db.query(Category).filter_by(name=name).first():
            db.add(Category(name=name))
    db.commit()
    print(f"[seed] categories: {len(CATEGORIES)} seeded")
