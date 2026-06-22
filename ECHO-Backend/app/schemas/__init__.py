"""Pydantic schemas for request/response validation"""

from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

# Enums
class UserRoleEnum(str, Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    SECURITY = "security"
    ADMIN = "admin"

class EventStatusEnum(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class EmergencyTypeEnum(str, Enum):
    MEDICAL = "medical"
    HARASSMENT = "harassment"
    ACCIDENT = "accident"
    FIRE = "fire"
    THEFT = "theft"
    OTHER = "other"

class AlertStatusEnum(str, Enum):
    CREATED = "created"
    ACTIVE = "active"
    SECURITY_ASSIGNED = "security_assigned"
    HELP_ON_WAY = "help_on_way"
    ARRIVED = "arrived"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"

class NotificationTypeEnum(str, Enum):
    PARENT = "parent"
    GUARDIAN = "guardian"
    SECURITY = "security"
    ADMIN = "admin"
    POLICE = "police"
    HOSPITAL = "hospital"

# Auth Schemas
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=6)
    role: UserRoleEnum = UserRoleEnum.STUDENT
    
    @validator('name')
    def name_alphanumeric(cls, v):
        assert v.replace(" ", "").isalpha(), "Name must contain only alphabetic characters"
        return v

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: UserRoleEnum
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Emergency Contact Schemas
class EmergencyContactCreate(BaseModel):
    contact_name: str = Field(..., min_length=2, max_length=255)
    phone_number: str = Field(..., min_length=10, max_length=20)
    relationship: str = Field(None, max_length=50)

class EmergencyContactUpdate(BaseModel):
    contact_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=10, max_length=20)
    relationship: Optional[str] = Field(None, max_length=50)

class EmergencyContactResponse(BaseModel):
    id: int
    user_id: int
    contact_name: str
    phone_number: str
    relationship: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# SOS Alert Schemas
class SOSAlertCreate(BaseModel):
    emergency_type: EmergencyTypeEnum
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location: Optional[str] = None
    description: Optional[str] = None

class SOSAlertUpdate(BaseModel):
    status: Optional[AlertStatusEnum] = None
    location: Optional[str] = None
    description: Optional[str] = None

class SOSAlertResponse(BaseModel):
    id: int
    alert_id: str
    user_id: int
    emergency_type: EmergencyTypeEnum
    latitude: float
    longitude: float
    location: Optional[str]
    description: Optional[str]
    status: AlertStatusEnum
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class SOSAlertDetailResponse(SOSAlertResponse):
    notifications: List['NotificationResponse'] = []
    tracking: Optional['EmergencyTrackingResponse'] = None

# Notification Schemas
class NotificationCreate(BaseModel):
    alert_id: int
    recipient: str
    notification_type: NotificationTypeEnum
    message: Optional[str] = None

class NotificationResponse(BaseModel):
    id: int
    alert_id: int
    recipient: str
    notification_type: NotificationTypeEnum
    status: str
    message: Optional[str]
    created_at: datetime
    sent_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Emergency Tracking Schemas
class EmergencyTrackingCreate(BaseModel):
    alert_id: int
    assigned_officer: Optional[str] = None
    eta_minutes: Optional[int] = None

class EmergencyTrackingUpdate(BaseModel):
    current_status: Optional[AlertStatusEnum] = None
    assigned_officer: Optional[str] = None
    eta_minutes: Optional[int] = None

class EmergencyTrackingResponse(BaseModel):
    id: int
    alert_id: int
    assigned_officer: Optional[str]
    current_status: AlertStatusEnum
    eta_minutes: Optional[int]
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Update forward references
SOSAlertDetailResponse.model_rebuild()

# User Minified Response
class UserMinResponse(BaseModel):
    id: int
    name: str
    email: str
    
    class Config:
        from_attributes = True

# Event Schemas
class EventCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    department: str = Field(..., min_length=2, max_length=255)
    event_date: datetime
    venue: str = Field(..., min_length=2, max_length=255)
    expected_attendees: int = Field(..., gt=0)
    
    @validator('event_date')
    def event_date_must_be_in_future(cls, v):
        now = datetime.now(v.tzinfo) if v.tzinfo else datetime.utcnow()
        if v < now:
            raise ValueError("Event date and time must be in the future")
        return v

class EventReview(BaseModel):
    status: EventStatusEnum
    review_comment: Optional[str] = None
    
    @validator('status')
    def status_must_be_approved_or_rejected(cls, v):
        if v not in [EventStatusEnum.APPROVED, EventStatusEnum.REJECTED]:
            raise ValueError("Status must be Approved or Rejected")
        return v

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    organizer_id: int
    organizer: Optional[UserMinResponse] = None
    department: str
    event_date: datetime
    venue: str
    expected_attendees: int
    status: EventStatusEnum
    review_comment: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
