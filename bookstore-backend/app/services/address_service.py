"""Address service — CRUD with user ownership enforcement."""
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.address import Address
from app.schemas.address import AddressRequest, AddressResponse


def _assert_owns(address: Address, user_id: str) -> None:
    if address.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


def list_addresses(db: Session, user_id: str) -> list[AddressResponse]:
    rows = db.query(Address).filter(Address.user_id == user_id).order_by(Address.created_at).all()
    return [AddressResponse.model_validate(r) for r in rows]


def create_address(db: Session, user_id: str, data: AddressRequest) -> AddressResponse:
    # If this address is being set as default, clear existing default for this user
    if data.is_default:
        db.query(Address).filter(Address.user_id == user_id, Address.is_default.is_(True)).update(
            {"is_default": False}
        )

    addr = Address(
        id=str(uuid.uuid4()),
        user_id=user_id,
        first_name=data.first_name,
        last_name=data.last_name,
        address_line=data.address_line,
        email=data.email,
        city=data.city,
        pin=data.pin,
        phone=data.phone,
        phone_country_code=data.phone_country_code,
        state=data.state,
        country=data.country,
        is_default=data.is_default,
    )
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return AddressResponse.model_validate(addr)


def get_address(db: Session, user_id: str, address_id: str) -> AddressResponse:
    addr = db.get(Address, address_id)
    if addr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    _assert_owns(addr, user_id)
    return AddressResponse.model_validate(addr)


def update_address(db: Session, user_id: str, address_id: str, data: AddressRequest) -> AddressResponse:
    addr = db.get(Address, address_id)
    if addr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    _assert_owns(addr, user_id)

    if data.is_default and not addr.is_default:
        db.query(Address).filter(Address.user_id == user_id, Address.is_default.is_(True)).update(
            {"is_default": False}
        )

    addr.first_name = data.first_name
    addr.last_name = data.last_name
    addr.address_line = data.address_line
    addr.email = data.email
    addr.city = data.city
    addr.pin = data.pin
    addr.phone = data.phone
    addr.phone_country_code = data.phone_country_code
    addr.state = data.state
    addr.country = data.country
    addr.is_default = data.is_default

    db.commit()
    db.refresh(addr)
    return AddressResponse.model_validate(addr)


def delete_address(db: Session, user_id: str, address_id: str) -> None:
    addr = db.get(Address, address_id)
    if addr is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    _assert_owns(addr, user_id)
    db.delete(addr)
    db.commit()
