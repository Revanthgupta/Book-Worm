from datetime import date, timedelta

from pydantic import BaseModel, computed_field


# ── Shared helpers ────────────────────────────────────────────────────────────

def _format_delivery_date(d: date) -> str:
    """Format a date as 'Mon, 21 Jul' (cross-platform, no leading zero on day)."""
    return d.strftime("%a, %-d %b") if hasattr(date, "_strftime_no_zero") else _fmt(d)


def _fmt(d: date) -> str:
    """Cross-platform day-of-month without leading zero."""
    weekday = d.strftime("%a")
    day = str(d.day)          # no leading zero
    month = d.strftime("%b")
    return f"{weekday}, {day} {month}"


def delivery_date_string(from_date: date | None = None) -> str:
    """Return today+7 days formatted as 'Mon, 21 Jul'."""
    base = from_date if from_date is not None else date.today()
    return _fmt(base + timedelta(days=7))


# ── Author schemas ────────────────────────────────────────────────────────────

class AuthorResponse(BaseModel):
    id: str
    name: str
    photo: str | None
    bio: str | None

    model_config = {"from_attributes": True}


# ── Book schemas ──────────────────────────────────────────────────────────────

class BookResponse(BaseModel):
    """Matches the frontend Book type exactly."""
    id: str                   # ISBN — primary key
    title: str
    author_id: str            # → frontend authorId
    author_name: str          # → frontend authorName (denormalised for convenience)
    publisher: str | None
    format: str | None
    categories: list[str]     # list of category names
    price: float
    cover_image: str | None   # → frontend coverImage
    synopsis: str | None
    back_cover_text: str | None  # → frontend backCoverText
    language: str | None
    rating: float | None
    sells: int
    delivery_date: str        # → frontend deliveryDate  e.g. "Mon, 21 Jul"
    featured: bool
    bestseller: bool
    new_launch: bool          # → frontend newLaunch

    model_config = {"from_attributes": True, "populate_by_name": True}


class BookListResponse(BaseModel):
    items: list[BookResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
