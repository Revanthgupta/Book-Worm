from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UpdateProfileRequest, UserResponse
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _build_response(user: User, token: str) -> UserResponse:
    """Build the UserResponse dict that matches the frontend User shape."""
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        token=token,
        gift_points=user.gift_points,
    )


# ── POST /api/auth/register ───────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new account and return a JWT."""
    user, token = auth_service.create_user(db, body.name, body.email, body.password)
    return _build_response(user, token)


# ── POST /api/auth/login ──────────────────────────────────────────────────────

@router.post("/login", response_model=UserResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return a JWT.

    Response shape: ``{ id, name, email, token, gift_points }``
    — matches the frontend ``User`` type exactly.
    """
    user, token = auth_service.authenticate_user(db, body.email, body.password)
    return _build_response(user, token)


# ── GET /api/auth/me ──────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the currently authenticated user (refreshed from DB)."""
    # Re-fetch to get latest gift_points in case it was updated
    user = auth_service.get_user_by_id(db, current_user.id)
    token = ""  # /me does not reissue a token; frontend keeps the stored one
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        token=token,
        gift_points=user.gift_points,
    )


# ── PUT /api/auth/me ──────────────────────────────────────────────────────────

@router.put("/me", response_model=UserResponse)
def update_me(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update name and/or password."""
    user = auth_service.update_profile(db, current_user, body.name, body.password)
    token = ""  # profile update does not reissue a token
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        token=token,
        gift_points=user.gift_points,
    )


# ── POST /api/auth/logout ─────────────────────────────────────────────────────

@router.post("/logout")
def logout():
    """Stateless logout — client removes the token from localStorage.

    No server state is modified; the JWT expires naturally.
    """
    return {"message": "ok"}
