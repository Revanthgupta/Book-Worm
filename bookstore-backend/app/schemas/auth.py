from pydantic import BaseModel, EmailStr, field_validator


# ── Requests ──────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def strip_password(cls, v: str) -> str:
        return v.strip()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UpdateProfileRequest(BaseModel):
    name: str | None = None
    password: str | None = None

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Name cannot be empty")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if len(v) < 6:
                raise ValueError("Password must be at least 6 characters")
        return v


# ── Responses ─────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Matches the frontend User type: { id, name, email, token, gift_points }."""
    id: str
    name: str
    email: str
    token: str
    gift_points: int

    model_config = {"from_attributes": True}
