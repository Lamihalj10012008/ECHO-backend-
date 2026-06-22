"""SQLAlchemy database models"""

from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship as orm_relationship
from datetime import datetime
import enum

from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    SECURITY = "security"
    ADMIN = "admin"

class EventStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class EmergencyType(str, enum.Enum):
    MEDICAL = "medical"
    HARASSMENT = "harassment"
    ACCIDENT = "accident"
    FIRE = "fire"
    THEFT = "theft"
    OTHER = "other"

class AlertStatus(str, enum.Enum):
    CREATED = "created"
    ACTIVE = "active"
    SECURITY_ASSIGNED = "security_assigned"
    HELP_ON_WAY = "help_on_way"
    ARRIVED = "arrived"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"

class NotificationType(str, enum.Enum):
    PARENT = "parent"
    GUARDIAN = "guardian"
    SECURITY = "security"
    ADMIN = "admin"
    POLICE = "police"
    HOSPITAL = "hospital"

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    DELIVERED = "delivered"

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    emergency_contacts = orm_relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")
    sos_alerts = orm_relationship("SOSAlert", back_populates="user", cascade="all, delete-orphan")
    events = orm_relationship("Event", back_populates="organizer", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"

class EmergencyContact(Base):
    """Emergency contact model"""
    __tablename__ = "emergency_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_name = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=False)
    relationship = Column("relationship_type", String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = orm_relationship("User", back_populates="emergency_contacts")
    
    def __repr__(self):
        return f"<EmergencyContact(id={self.id}, contact_name={self.contact_name})>"

class SOSAlert(Base):
    """SOS alert model"""
    __tablename__ = "sos_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    emergency_type = Column(Enum(EmergencyType), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(Enum(AlertStatus), default=AlertStatus.CREATED)
    escalation_level = Column(Integer, default=1)  # 1: Parent/Guardian, 2: Campus Security, 3: ERT
    nearest_security_office = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = orm_relationship("User", back_populates="sos_alerts")
    notifications = orm_relationship("Notification", back_populates="alert", cascade="all, delete-orphan")
    tracking = orm_relationship("EmergencyTracking", back_populates="alert", cascade="all, delete-orphan", uselist=False)
    
    def __repr__(self):
        return f"<SOSAlert(id={self.id}, alert_id={self.alert_id}, status={self.status})>"

class Notification(Base):
    """Notification model"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("sos_alerts.id"), nullable=False)
    recipient = Column(String(255), nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime, nullable=True)
    
    # Relationships
    alert = orm_relationship("SOSAlert", back_populates="notifications")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, type={self.notification_type}, status={self.status})>"

class EmergencyTracking(Base):
    """Emergency tracking model"""
    __tablename__ = "emergency_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("sos_alerts.id"), nullable=False, unique=True)
    assigned_officer = Column(String(255), nullable=True)
    current_status = Column(Enum(AlertStatus), default=AlertStatus.CREATED)
    eta_minutes = Column(Integer, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    alert = orm_relationship("SOSAlert", back_populates="tracking")
    
    def __repr__(self):
        return f"<EmergencyTracking(id={self.id}, alert_id={self.alert_id}, status={self.current_status})>"

class Event(Base):
    """Event model for coordination"""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department = Column(String(255), nullable=False)
    event_date = Column(DateTime, nullable=False)
    venue = Column(String(255), nullable=False)
    expected_attendees = Column(Integer, nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.PENDING)
    review_comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organizer = orm_relationship("User", back_populates="events")
    
    def __repr__(self):
        return f"<Event(id={self.id}, title={self.title}, status={self.status})>"

class NotificationLog(Base):
    """NotificationLog model"""
    __tablename__ = "notification_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    sos_id = Column(Integer, ForeignKey("sos_alerts.id"), nullable=False)
    recipient = Column(String(255), nullable=False)
    channel = Column(String(50), nullable=False)  # SMS/WhatsApp/Push
    delivery_status = Column(String(50), nullable=False)  # pending/sent/failed/delivered
    provider_message_id = Column(String(100), nullable=True)  # Twilio message SID
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    alert = orm_relationship("SOSAlert")
    
    def __repr__(self):
        return f"<NotificationLog(id={self.id}, sos_id={self.sos_id}, channel={self.channel}, status={self.delivery_status})>"

class AuditLog(Base):
    """AuditLog model"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, timestamp={self.timestamp})>"
