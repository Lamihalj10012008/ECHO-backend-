"""SOS Alert routes"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import SOSAlertCreate, SOSAlertResponse, SOSAlertDetailResponse, SOSAlertUpdate
from app.auth.utils import get_current_user, get_current_security_user
from app.services import SOSAlertService, NotificationService
from app.models import User, AlertStatus

router = APIRouter()

@router.post("/alert", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_sos_alert(
    alert_data: SOSAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new SOS alert"""
    
    # Create alert
    alert = SOSAlertService.create_alert(db, current_user.id, alert_data)
    
    # Send notifications
    NotificationService.send_notifications(db, alert)
    
    # Get notified emergency contacts list
    from app.models import EmergencyContact
    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).all()
    notified_contacts = [
        {
            "name": c.contact_name,
            "phone_number": c.phone_number,
            "relationship": c.relationship
        }
        for c in contacts
    ]
    
    return {
        "alertId": alert.alert_id,
        "status": alert.status.value,
        "message": "Emergency alert created successfully",
        "id": alert.id,
        "notified_contacts": notified_contacts
    }

@router.get("/alerts", response_model=list[SOSAlertResponse])
async def get_sos_alerts(
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get user's SOS alerts"""
    
    alerts = SOSAlertService.get_user_alerts(db, current_user.id, skip, limit)
    return alerts

@router.get("/alerts/active", response_model=list[SOSAlertResponse])
async def get_active_alerts(
    current_user: User = Depends(get_current_security_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all active alerts (security/admin only)"""
    
    alerts = SOSAlertService.get_active_alerts(db, skip, limit)
    return alerts

@router.get("/alerts/{alert_id}", response_model=SOSAlertDetailResponse)
async def get_sos_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific SOS alert details"""
    
    alert = SOSAlertService.get_alert_by_id(db, alert_id)
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # Check authorization
    if alert.user_id != current_user.id and current_user.role.value not in ["security", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this alert"
        )
    
    return alert

@router.put("/alerts/{alert_id}/status", response_model=SOSAlertResponse)
async def update_alert_status(
    alert_id: int,
    status_update: SOSAlertUpdate,
    current_user: User = Depends(get_current_security_user),
    db: Session = Depends(get_db)
):
    """Update SOS alert status (security/admin only)"""
    
    alert = SOSAlertService.get_alert_by_id(db, alert_id)
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    if status_update.status:
        alert = SOSAlertService.update_alert_status(db, alert_id, status_update.status)
    
    if status_update.location:
        alert.location = status_update.location
        db.commit()
        db.refresh(alert)
    
    if status_update.description:
        alert.description = status_update.description
        db.commit()
        db.refresh(alert)
    
    return alert

@router.delete("/alerts/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_sos_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a SOS alert"""
    
    alert = SOSAlertService.get_alert_by_id(db, alert_id)
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # Check authorization
    if alert.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this alert"
        )
    
    SOSAlertService.cancel_alert(db, alert_id)
