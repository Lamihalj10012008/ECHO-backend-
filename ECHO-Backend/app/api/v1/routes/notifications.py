"""Notifications routes"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas import NotificationCreate, NotificationResponse
from app.auth.utils import get_current_user, get_current_security_user
from app.services import NotificationService
from app.models import User, Notification

router = APIRouter()

@router.get("", response_model=list[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get user's notifications"""
    
    # Get notifications for user's alerts
    from app.models import SOSAlert
    user_alerts = db.query(SOSAlert).filter(SOSAlert.user_id == current_user.id).with_entities(SOSAlert.id).all()
    alert_ids = [alert[0] for alert in user_alerts]
    
    notifications = db.query(Notification)\
        .filter(Notification.alert_id.in_(alert_ids))\
        .order_by(Notification.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return notifications

@router.post("/send", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def send_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(get_current_security_user),
    db: Session = Depends(get_db)
):
    """Send a notification (security/admin only)"""
    
    notification = NotificationService.create_notification(
        db,
        alert_id=notification_data.alert_id,
        recipient=notification_data.recipient,
        notification_type=notification_data.notification_type,
        message=notification_data.message
    )
    
    return notification

@router.put("/{notification_id}/mark-sent", response_model=NotificationResponse)
async def mark_notification_sent(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notification as sent"""
    
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check if user is authorized (owner of the alert)
    from app.models import SOSAlert
    alert = db.query(SOSAlert).filter(SOSAlert.id == notification.alert_id).first()
    
    if alert.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    notification = NotificationService.mark_notification_sent(db, notification_id)
    return notification
