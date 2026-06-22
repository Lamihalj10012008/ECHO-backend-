"""Emergency Tracking routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import EmergencyTrackingResponse, EmergencyTrackingUpdate
from app.auth.utils import get_current_user, get_current_security_user
from app.services import TrackingService
from app.models import User, SOSAlert

router = APIRouter()

@router.get("/{alert_id}", response_model=EmergencyTrackingResponse)
async def get_tracking_info(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get emergency tracking information"""
    
    # Check if alert exists and user is authorized
    alert = db.query(SOSAlert).filter(SOSAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # Check authorization
    if alert.user_id != current_user.id and current_user.role.value not in ["security", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view tracking info"
        )
    
    tracking = TrackingService.get_tracking(db, alert_id)
    
    if not tracking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tracking information not found"
        )
    
    return tracking

@router.put("/{alert_id}", response_model=EmergencyTrackingResponse)
async def update_tracking_info(
    alert_id: int,
    tracking_data: EmergencyTrackingUpdate,
    current_user: User = Depends(get_current_security_user),
    db: Session = Depends(get_db)
):
    """Update emergency tracking information (security/admin only)"""
    
    # Check if alert exists
    alert = db.query(SOSAlert).filter(SOSAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    tracking = TrackingService.get_tracking(db, alert_id)
    
    if not tracking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tracking information not found"
        )
    
    # Update tracking information
    if tracking_data.assigned_officer:
        tracking = TrackingService.assign_officer(db, alert_id, tracking_data.assigned_officer)
    
    if tracking_data.eta_minutes:
        tracking = TrackingService.update_eta(db, alert_id, tracking_data.eta_minutes)
    
    if tracking_data.current_status:
        from app.models import AlertStatus
        tracking.current_status = tracking_data.current_status
        db.commit()
        db.refresh(tracking)
    
    return tracking

@router.post("/{alert_id}/assign", response_model=EmergencyTrackingResponse)
async def assign_officer(
    alert_id: int,
    officer_name: str,
    current_user: User = Depends(get_current_security_user),
    db: Session = Depends(get_db)
):
    """Assign security officer to alert"""
    
    alert = db.query(SOSAlert).filter(SOSAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    tracking = TrackingService.assign_officer(db, alert_id, officer_name)
    
    return tracking

@router.post("/{alert_id}/eta", response_model=EmergencyTrackingResponse)
async def set_eta(
    alert_id: int,
    eta_minutes: int,
    current_user: User = Depends(get_current_security_user),
    db: Session = Depends(get_db)
):
    """Set ETA for help arrival"""
    
    alert = db.query(SOSAlert).filter(SOSAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    if eta_minutes < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ETA cannot be negative"
        )
    
    tracking = TrackingService.update_eta(db, alert_id, eta_minutes)
    
    return tracking

@router.post("/{alert_id}/arrival", response_model=EmergencyTrackingResponse)
async def mark_arrival(
    alert_id: int,
    current_user: User = Depends(get_current_security_user),
    db: Session = Depends(get_db)
):
    """Mark help as arrived"""
    
    alert = db.query(SOSAlert).filter(SOSAlert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    tracking = TrackingService.mark_arrival(db, alert_id)
    
    return tracking
