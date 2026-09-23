"""Addresses router."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.address import AddressRequest, AddressResponse
from app.services import address_service

router = APIRouter(prefix="/api/addresses", tags=["addresses"])


@router.get("", response_model=list[AddressResponse])
def list_addresses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return address_service.list_addresses(db, current_user.id)


@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    body: AddressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return address_service.create_address(db, current_user.id, body)


@router.get("/{address_id}", response_model=AddressResponse)
def get_address(
    address_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return address_service.get_address(db, current_user.id, address_id)


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: str,
    body: AddressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return address_service.update_address(db, current_user.id, address_id, body)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address_service.delete_address(db, current_user.id, address_id)
