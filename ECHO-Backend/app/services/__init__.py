"""Business logic services"""

from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import logging

from app.models import User, SOSAlert, Notification, EmergencyTracking, EmergencyContact
from app.models import EmergencyType, AlertStatus, NotificationType, NotificationStatus
from app.schemas import SOSAlertCreate, NotificationCreate, EmergencyTrackingCreate
from app.auth.utils import hash_password

logger = logging.getLogger(__name__)

class UserService:
    """User service for user operations"""
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def create_user(db: Session, name: str, email: str, phone: str, password: str, role: str) -> User:
        """Create a new user"""
        hashed_password = hash_password(password)
        
        user = User(
            name=name,
            email=email,
            phone=phone,
            hashed_password=hashed_password,
            role=role
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"User created: {email}")
        return user

class SOSAlertService:
    """SOS Alert service for alert operations"""
    
    @staticmethod
    def generate_alert_id() -> str:
        """Generate unique alert ID"""
        return f"SOS{uuid.uuid4().hex[:8].upper()}"
    
    @staticmethod
    def create_alert(db: Session, user_id: int, alert_data: SOSAlertCreate) -> SOSAlert:
        """Create a new SOS alert"""
        alert = SOSAlert(
            alert_id=SOSAlertService.generate_alert_id(),
            user_id=user_id,
            emergency_type=alert_data.emergency_type,
            latitude=alert_data.latitude,
            longitude=alert_data.longitude,
            location=alert_data.location,
            description=alert_data.description,
            status=AlertStatus.CREATED
        )
        
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
        # Create tracking record
        tracking = EmergencyTracking(
            alert_id=alert.id,
            current_status=AlertStatus.CREATED
        )
        db.add(tracking)
        db.commit()
        
        logger.info(f"SOS Alert created: {alert.alert_id}")
        return alert
    
    @staticmethod
    def get_alert_by_id(db: Session, alert_id: int) -> SOSAlert:
        """Get alert by ID"""
        return db.query(SOSAlert).filter(SOSAlert.id == alert_id).first()
    
    @staticmethod
    def get_alert_by_alert_id(db: Session, alert_id: str) -> SOSAlert:
        """Get alert by alert_id"""
        return db.query(SOSAlert).filter(SOSAlert.alert_id == alert_id).first()
    
    @staticmethod
    def get_user_alerts(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> list:
        """Get user's alerts with pagination"""
        return db.query(SOSAlert)\
            .filter(SOSAlert.user_id == user_id)\
            .order_by(SOSAlert.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_active_alerts(db: Session, skip: int = 0, limit: int = 10) -> list:
        """Get all active alerts"""
        return db.query(SOSAlert)\
            .filter(SOSAlert.status.in_([AlertStatus.CREATED, AlertStatus.SECURITY_ASSIGNED, AlertStatus.HELP_ON_WAY]))\
            .order_by(SOSAlert.created_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def update_alert_status(db: Session, alert_id: int, new_status: AlertStatus, message: str = None) -> SOSAlert:
        """Update alert status"""
        alert = SOSAlertService.get_alert_by_id(db, alert_id)
        
        if not alert:
            return None
        
        alert.status = new_status
        alert.updated_at = datetime.utcnow()
        
        if new_status == AlertStatus.RESOLVED:
            alert.resolved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(alert)
        
        # Update tracking
        if alert.tracking:
            alert.tracking.current_status = new_status
            db.commit()
        
        logger.info(f"Alert {alert.alert_id} status updated to {new_status}")
        return alert
    
    @staticmethod
    def cancel_alert(db: Session, alert_id: int) -> SOSAlert:
        """Cancel an alert"""
        return SOSAlertService.update_alert_status(db, alert_id, AlertStatus.CANCELLED)

class NotificationService:
    """Notification service for notification operations"""
    
    @staticmethod
    def create_notification(db: Session, alert_id: int, recipient: str, notification_type: NotificationType, message: str = None) -> Notification:
        """Create a notification"""
        notification = Notification(
            alert_id=alert_id,
            recipient=recipient,
            notification_type=notification_type,
            message=message,
            status=NotificationStatus.PENDING
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        logger.info(f"Notification created for {recipient}: {notification_type}")
        return notification
    
    @staticmethod
    def send_notifications(db: Session, alert: SOSAlert) -> list:
        """Send notifications for an alert"""
        notifications = []
        
        # Get user's emergency contacts
        user = alert.user
        contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == user.id).all()
        
        # Notify parent/guardian
        for contact in contacts:
            msg = f"Emergency alert from {user.name}. Location: {alert.location or 'unknown location'}"
            notification = NotificationService.create_notification(
                db,
                alert.id,
                contact.phone_number,
                NotificationType.PARENT,
                msg
            )
            # Simulate real-time SMS dispatch in stdout
            print(f"[SMS SIMULATION] Dispatched emergency SMS in real-time to {contact.contact_name} ({contact.phone_number}) [Relationship: {contact.relationship}]: {msg}")
            
            # Immediately mark as sent to show real-time delivery
            NotificationService.mark_notification_sent(db, notification.id)
            notifications.append(notification)
        
        # Notify security
        notification = NotificationService.create_notification(
            db,
            alert.id,
            "security@campus.edu",
            NotificationType.SECURITY,
            f"SOS Alert from {user.name} at {alert.location}"
        )
        NotificationService.mark_notification_sent(db, notification.id)
        notifications.append(notification)
        
        # Notify admin
        notification = NotificationService.create_notification(
            db,
            alert.id,
            "admin@campus.edu",
            NotificationType.ADMIN,
            f"SOS Alert - {alert.emergency_type.value} from {user.name}"
        )
        NotificationService.mark_notification_sent(db, notification.id)
        notifications.append(notification)
        
        logger.info(f"Notifications sent for alert {alert.alert_id}")
        return notifications
    
    @staticmethod
    def get_alert_notifications(db: Session, alert_id: int) -> list:
        """Get notifications for an alert"""
        return db.query(Notification).filter(Notification.alert_id == alert_id).all()
    
    @staticmethod
    def mark_notification_sent(db: Session, notification_id: int) -> Notification:
        """Mark notification as sent"""
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        
        if notification:
            notification.status = NotificationStatus.SENT
            notification.sent_at = datetime.utcnow()
            db.commit()
            db.refresh(notification)
        
        return notification

class TrackingService:
    """Emergency tracking service"""
    
    @staticmethod
    def get_tracking(db: Session, alert_id: int) -> EmergencyTracking:
        """Get tracking info for an alert"""
        return db.query(EmergencyTracking).filter(EmergencyTracking.alert_id == alert_id).first()
    
    @staticmethod
    def assign_officer(db: Session, alert_id: int, officer_name: str) -> EmergencyTracking:
        """Assign security officer to alert"""
        tracking = TrackingService.get_tracking(db, alert_id)
        
        if tracking:
            tracking.assigned_officer = officer_name
            tracking.current_status = AlertStatus.SECURITY_ASSIGNED
            db.commit()
            db.refresh(tracking)
            
            logger.info(f"Officer {officer_name} assigned to alert {alert_id}")
        
        return tracking
    
    @staticmethod
    def update_eta(db: Session, alert_id: int, eta_minutes: int) -> EmergencyTracking:
        """Update ETA for help arrival"""
        tracking = TrackingService.get_tracking(db, alert_id)
        
        if tracking:
            tracking.eta_minutes = eta_minutes
            tracking.current_status = AlertStatus.HELP_ON_WAY
            db.commit()
            db.refresh(tracking)
        
        return tracking
    
    @staticmethod
    def mark_arrival(db: Session, alert_id: int) -> EmergencyTracking:
        """Mark help as arrived"""
        tracking = TrackingService.get_tracking(db, alert_id)
        
        if tracking:
            tracking.current_status = AlertStatus.ARRIVED
            db.commit()
            db.refresh(tracking)
        
        return tracking

class ContactService:
    """Emergency contact service"""
    
    @staticmethod
    def get_user_contacts(db: Session, user_id: int) -> list:
        """Get user's emergency contacts"""
        return db.query(EmergencyContact).filter(EmergencyContact.user_id == user_id).all()
    
    @staticmethod
    def create_contact(db: Session, user_id: int, contact_name: str, phone_number: str, relationship: str = None) -> EmergencyContact:
        """Create emergency contact"""
        contact = EmergencyContact(
            user_id=user_id,
            contact_name=contact_name,
            phone_number=phone_number,
            relationship=relationship
        )
        
        db.add(contact)
        db.commit()
        db.refresh(contact)
        
        logger.info(f"Emergency contact created for user {user_id}")
        return contact
    
    @staticmethod
    def update_contact(db: Session, contact_id: int, **kwargs) -> EmergencyContact:
        """Update emergency contact"""
        contact = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id).first()
        
        if contact:
            for key, value in kwargs.items():
                if value is not None:
                    setattr(contact, key, value)
            
            contact.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(contact)
        
        return contact
    
    @staticmethod
    def delete_contact(db: Session, contact_id: int) -> bool:
        """Delete emergency contact"""
        contact = db.query(EmergencyContact).filter(EmergencyContact.id == contact_id).first()
        
        if contact:
            db.delete(contact)
            db.commit()
            return True
        
        return False
