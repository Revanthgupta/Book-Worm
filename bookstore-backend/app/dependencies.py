from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import SessionLocal

# auto_error=False lets us return a consistent 401 instead of FastAPI's default 403
# when the Authorization header is absent.
_bearer = HTTPBearer(auto_error=False)


# ── Database session ──────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Current authenticated user ────────────────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
):
    """Extract and validate the Bearer JWT; return the User ORM row.

    Raises HTTP 401 if the token is missing, invalid, or the user is not found.
    """
    # Import here to avoid circular imports at module load time
    from app.models.user import User  # noqa: PLC0415

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # credentials is None when the Authorization header is absent
    if credentials is None:
        raise credentials_exception

    try:
        user_id = decode_access_token(credentials.credentials)
    except JWTError:
        raise credentials_exception

    user = db.get(User, user_id)
    if user is None:
        raise credentials_exception
    return user
