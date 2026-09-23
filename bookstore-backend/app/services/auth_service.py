"""Authentication service — user lookup, creation, token issuance."""
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User


# ── Helpers ───────────────────────────────────────────────────────────────────

def _user_not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
    )


# ── Public API ────────────────────────────────────────────────────────────────

def authenticate_user(db: Session, email: str, password: str) -> tuple[User, str]:
    """Verify credentials and return (user, token).

    Raises HTTP 401 on failure — never leaks whether the email exists.
    """
    user: User | None = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(password, user.hashed_password):
        raise _user_not_found()
    token = create_access_token(user.id)
    return user, token


def create_user(db: Session, name: str, email: str, password: str) -> tuple[User, str]:
    """Create a new user account.

    Raises HTTP 409 if the email is already registered.
    """
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    user = User(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        hashed_password=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return user, token


def get_user_by_id(db: Session, user_id: str) -> User:
    """Return a User by id.

    Raises HTTP 404 if not found.
    """
    user: User | None = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def update_profile(
    db: Session,
    user: User,
    name: str | None,
    password: str | None,
) -> User:
    """Update name and/or password in-place."""
    if name is not None:
        user.name = name
    if password is not None:
        user.hashed_password = hash_password(password)
    db.commit()
    db.refresh(user)
    return user
