"""Pydantic schemas for the Addresses API."""
import re
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ── Validators ────────────────────────────────────────────────────────────────
_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
_PIN_RE = re.compile(r"^\d{6}$")


# ── Requests ──────────────────────────────────────────────────────────────────

class AddressRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    address_line: str = Field(..., min_length=1, max_length=500)
    email: str = Field(..., max_length=320)
    city: str = Field(..., min_length=1, max_length=100)
    pin: str = Field(..., min_length=6, max_length=6)
    phone: str = Field(..., min_length=1, max_length=20)
    phone_country_code: str = Field(default="+91", max_length=10)
    state: str = Field(..., min_length=1, max_length=100)
    country: str = Field(default="India", max_length=100)
    is_default: bool = False

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not _EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v

    @field_validator("pin")
    @classmethod
    def validate_pin(cls, v: str) -> str:
        if not _PIN_RE.match(v):
            raise ValueError("PIN must be exactly 6 digits")
        return v


# ── Responses ─────────────────────────────────────────────────────────────────

class AddressResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    address_line: str
    email: str
    city: str
    pin: str
    phone: str
    phone_country_code: str
    state: str
    country: str
    is_default: bool

    model_config = {"from_attributes": True}
