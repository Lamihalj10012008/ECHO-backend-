"""Emergency Contacts routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import EmergencyContactCreate, EmergencyContactUpdate, EmergencyContactResponse
from app.auth.utils import get_current_user
from app.services import ContactService
from app.models import User, EmergencyContact

router = APIRouter()

@router.get("", response_model=list[EmergencyContactResponse])
async def get_emergency_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's emergency contacts"""
    
    contacts = ContactService.get_user_contacts(db, current_user.id)
    return contacts

@router.post("", response_model=EmergencyContactResponse, status_code=status.HTTP_201_CREATED)
async def create_emergency_contact(
    contact_data: EmergencyContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new emergency contact"""
    
    contact = ContactService.create_contact(
        db,
        user_id=current_user.id,
        contact_name=contact_data.contact_name,
        phone_number=contact_data.phone_number,
        relationship=contact_data.relationship
    )
    
    return contact

@router.put("/{contact_id}", response_model=EmergencyContactResponse)
async def update_emergency_contact(
    contact_id: int,
    contact_data: EmergencyContactUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update emergency contact"""
    
    contact = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Check authorization
    if contact.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this contact"
        )
    
    contact = ContactService.update_contact(
        db,
        contact_id,
        contact_name=contact_data.contact_name,
        phone_number=contact_data.phone_number,
        relationship=contact_data.relationship
    )
    
    return contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_emergency_contact(
    contact_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete emergency contact"""
    
    contact = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )
    
    # Check authorization
    if contact.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this contact"
        )
    
    ContactService.delete_contact(db, contact_id)
