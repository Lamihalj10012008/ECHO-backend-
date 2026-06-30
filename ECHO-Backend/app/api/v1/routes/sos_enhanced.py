"""
Enhanced SOS Alert System Routers and Controller
Defines the requested endpoints:
- Contacts CRUD (/api/contacts)
- SOS triggering and tracking (/api/sos)
- Notifications logging and retries (/api/notifications)
"""

import os
import re
import math
import time
import logging
import json
import httpx
from datetime import datetime
from typing import List, Optional
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator

from app.core.database import get_db
from app.core.config import settings
from app.auth.utils import get_current_user, get_current_security_user
from app.models import (
    User, EmergencyContact, SOSAlert, NotificationLog, 
    AuditLog, EmergencyTracking, AlertStatus, EmergencyType
)
from app.schemas import (
    EmergencyContactCreate, EmergencyContactUpdate, EmergencyContactResponse,
    SOSAlertCreate, SOSAlertResponse
)

logger = logging.getLogger(__name__)

# Create Routers
contacts_router = APIRouter()
sos_router = APIRouter()
notifications_router = APIRouter()

# ---------------------------------------------------------
# 1. Rate Limiting Utility
# ---------------------------------------------------------
# Stores IP address -> list of request timestamps
request_history = defaultdict(list)

def rate_limit(limit: int, window: int):
    """
    Rate limiting dependency.
    limit: Number of requests allowed
    window: Time window in seconds
    """
    async def dependency(request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        # Filter out timestamps older than the window
        request_history[client_ip] = [t for t in request_history[client_ip] if now - t < window]
        if len(request_history[client_ip]) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {limit} requests per {window} seconds are allowed."
            )
        request_history[client_ip].append(now)
    return dependency

# ---------------------------------------------------------
# 2. Audit Logging Utility
# ---------------------------------------------------------
def log_audit(db: Session, user_id: Optional[int], action: str, details: str = None):
    """Creates a new record in the AuditLog database table"""
    try:
        audit = AuditLog(user_id=user_id, action=action, details=details, timestamp=datetime.utcnow())
        db.add(audit)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to log audit event: {e}")
        db.rollback()

# ---------------------------------------------------------
# 3. Phone Number Validation & Normalization
# ---------------------------------------------------------
def validate_and_normalize_phone(phone: str) -> str:
    """
    Validates that a phone number contains 10 to 15 digits (excluding formatting characters).
    Normalizes it by stripping spaces, hyphens, and parentheses.
    """
    normalized = re.sub(r'[\s\-()]', '', phone)
    if not re.match(r'^\+?\d{10,15}$', normalized):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format. Must contain 10-15 digits, optionally starting with '+'."
        )
    return normalized

# ---------------------------------------------------------
# 4. Proximity / Campus Security Proximity Calculator
# ---------------------------------------------------------
CAMPUS_SECURITY_OFFICES = [
    {"name": "Library Security Desk", "latitude": 12.9716, "longitude": 77.5946, "phone": "+91-9876543214"},
    {"name": "Admin Block Security Office", "latitude": 12.9725, "longitude": 77.5955, "phone": "+91-9876543215"},
    {"name": "Hostel Block Security Office", "latitude": 12.9705, "longitude": 77.5935, "phone": "+91-9876543216"},
    {"name": "Sports Complex Security Post", "latitude": 12.9735, "longitude": 77.5965, "phone": "+91-9876543217"}
]

def find_nearest_security_office(latitude: float, longitude: float) -> dict:
    """Calculates the closest campus security post using simple Euclidean distance."""
    nearest_office = CAMPUS_SECURITY_OFFICES[0]
    min_distance = float('inf')
    for office in CAMPUS_SECURITY_OFFICES:
        dist = math.sqrt((office["latitude"] - latitude)**2 + (office["longitude"] - longitude)**2)
        if dist < min_distance:
            min_distance = dist
            nearest_office = office
    return nearest_office

# ---------------------------------------------------------
# 5. Twilio SMS & WhatsApp Sender (with Mock Fallback)
# ---------------------------------------------------------
async def send_twilio_notification(
    db: Session,
    sos_id: int,
    recipient: str,
    channel: str,
    message: str
):
    """
    Dispatches notifications using Twilio API (SMS or WhatsApp).
    If credentials are missing, falls back to a simulated delivery log.
    Updates NotificationLog with the delivery status.
    """
    account_sid = settings.TWILIO_ACCOUNT_SID or os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = settings.TWILIO_AUTH_TOKEN or os.getenv("TWILIO_AUTH_TOKEN")
    from_sms = settings.TWILIO_FROM_SMS or os.getenv("TWILIO_FROM_SMS")
    from_whatsapp = settings.TWILIO_FROM_WHATSAPP or os.getenv("TWILIO_FROM_WHATSAPP", "whatsapp:+14155238886")
    
    # Initialize notification log
    log = NotificationLog(
        sos_id=sos_id,
        recipient=recipient,
        channel=channel,
        delivery_status="pending",
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    is_configured = bool(account_sid and auth_token and (from_sms if channel == "SMS" else from_whatsapp))

    if not is_configured:
        # Graceful simulated fallback
        time.sleep(0.5)  # Simulate network latency
        simulated_sid = f"SMmock{os.urandom(16).hex()}"
        log.provider_message_id = simulated_sid
        log.delivery_status = "delivered"
        db.commit()
        
        safe_body = message.encode('ascii', errors='replace').decode('ascii')
        print(f"[SMS/WHATSAPP SIMULATION] channel={channel} to={recipient} SID={simulated_sid}\nBody: {safe_body}\n")
        
        # Broadcast the notification log update to WS
        await broadcast_ws_update(db, sos_id, {
            "type": "notification_status",
            "notification_id": log.id,
            "channel": channel,
            "recipient": recipient,
            "status": "delivered",
            "provider_message_id": simulated_sid
        })
        return log

    # Real Twilio API Call
    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    
    to_number = recipient
    from_number = from_sms if channel == "SMS" else from_whatsapp
    
    if channel == "WhatsApp":
        if not to_number.startswith("whatsapp:"):
            to_number = f"whatsapp:{to_number}"
        if not from_number.startswith("whatsapp:"):
            from_number = f"whatsapp:{from_number}"
    else:
        # Standardize for Twilio (ensure it starts with + if missing, etc.)
        if not to_number.startswith("+"):
            to_number = f"+{to_number}"
        if not from_number.startswith("+"):
            from_number = f"+{from_number}"
    
    data = {
        "To": to_number,
        "From": from_number,
        "Body": message
    }
    
    # Twilio webhook for tracking
    callback_url = os.getenv("CALLBACK_URL")
    if callback_url:
        data["StatusCallback"] = f"{callback_url}/api/notifications/callback"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                data=data,
                auth=(account_sid, auth_token),
                timeout=10.0
            )
            
            if response.status_code in [200, 201]:
                res_data = response.json()
                log.provider_message_id = res_data.get("sid")
                log.delivery_status = "delivered"
                db.commit()
                logger.info(f"Twilio message sent successfully: {res_data.get('sid')}")
            else:
                log.delivery_status = "failed"
                db.commit()
                logger.error(f"Twilio API request failed: {response.status_code} - {response.text}")
                
    except Exception as e:
        log.delivery_status = "failed"
        db.commit()
        logger.error(f"Exception raised while sending Twilio message: {e}")
        
    # Broadcast status update via WebSocket
    await broadcast_ws_update(db, sos_id, {
        "type": "notification_status",
        "notification_id": log.id,
        "channel": channel,
        "recipient": recipient,
        "status": log.delivery_status,
        "provider_message_id": log.provider_message_id
    })
    
    return log

# ---------------------------------------------------------
# 6. WebSocket Helper Function
# ---------------------------------------------------------
async def broadcast_ws_update(db: Session, sos_id: int, payload: dict):
    """Helper to push updates through the connection manager"""
    try:
        from main import ws_manager
        # Send update to all clients
        await ws_manager.broadcast(json.dumps({
            "sos_id": sos_id,
            **payload
        }))
    except Exception as e:
        logger.warn(f"WebSocket broadcast skipped or failed: {e}")

# ---------------------------------------------------------
# 7. Contacts Endpoints (/api/contacts)
# ---------------------------------------------------------
@contacts_router.get("", response_model=List[EmergencyContactResponse])
def get_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all emergency contacts for the authenticated student."""
    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).all()
    return contacts

@contacts_router.post("", response_model=EmergencyContactResponse, status_code=status.HTTP_201_CREATED)
def add_contact(
    contact_in: EmergencyContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    _rate: None = Depends(rate_limit(limit=10, window=60))
):
    """
    Adds a new emergency contact.
    Validates the phone number format.
    Checks for duplicates by phone number. If a contact already exists for the user,
    updates the record in-place instead of creating a duplicate.
    """
    normalized_phone = validate_and_normalize_phone(contact_in.phone_number)
    
    # Check for duplicate
    existing = db.query(EmergencyContact).filter(
        EmergencyContact.user_id == current_user.id,
        EmergencyContact.phone_number == normalized_phone
    ).first()
    
    if existing:
        # Update details in-place
        existing.contact_name = contact_in.contact_name
        existing.relationship = contact_in.relationship or existing.relationship
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        
        log_audit(
            db, 
            current_user.id, 
            "UPDATE_CONTACT_DUPLICATE_PREVENTION", 
            f"Updated contact {existing.id} ({existing.contact_name}) instead of creating duplicates."
        )
        return existing

    # Create new contact
    new_contact = EmergencyContact(
        user_id=current_user.id,
        contact_name=contact_in.contact_name,
        phone_number=normalized_phone,
        relationship=contact_in.relationship,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    
    log_audit(db, current_user.id, "ADD_CONTACT", f"Added emergency contact: {new_contact.contact_name} ({new_contact.phone_number})")
    return new_contact

@contacts_router.put("/{id}", response_model=EmergencyContactResponse)
def update_contact(
    id: int,
    contact_in: EmergencyContactUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Edits an existing emergency contact."""
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == id,
        EmergencyContact.user_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Emergency contact not found.")
        
    if contact_in.phone_number is not None:
        contact.phone_number = validate_and_normalize_phone(contact_in.phone_number)
        
    if contact_in.contact_name is not None:
        contact.contact_name = contact_in.contact_name
        
    if contact_in.relationship is not None:
        contact.relationship = contact_in.relationship
        
    contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contact)
    
    log_audit(db, current_user.id, "EDIT_CONTACT", f"Updated emergency contact: {contact.contact_name} ({contact.phone_number})")
    return contact

@contacts_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an emergency contact."""
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == id,
        EmergencyContact.user_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Emergency contact not found.")
        
    contact_name = contact.contact_name
    db.delete(contact)
    db.commit()
    
    log_audit(db, current_user.id, "DELETE_CONTACT", f"Deleted emergency contact: {contact_name}")
    return None


# ---------------------------------------------------------
# 8. SOS Alerts Endpoints (/api/sos)
# ---------------------------------------------------------
class SOSResponseSchema(BaseModel):
    id: int
    alert_id: str
    user_id: int
    emergency_type: str
    latitude: float
    longitude: float
    location: Optional[str]
    status: str
    escalation_level: int
    nearest_security_office: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

@sos_router.post("/trigger", response_model=SOSResponseSchema, status_code=status.HTTP_201_CREATED)
async def trigger_sos(
    alert_in: SOSAlertCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    _rate: None = Depends(rate_limit(limit=5, window=60))
):
    """
    Triggers a critical SOS Alert:
    - Captures coordinates, emergency type, and location.
    - Sets state to ACTIVE immediately.
    - Resolves the nearest campus security post.
    - Sends WhatsApp and SMS notifications in background tasks.
    - Broadcasts the update to the security dashboard using WebSockets.
    - Logs details in the audit database.
    """
    import uuid
    generated_alert_id = f"SOS{uuid.uuid4().hex[:8].upper()}"
    
    # Identify nearest security office
    nearest_office = find_nearest_security_office(alert_in.latitude, alert_in.longitude)
    
    # Create SOS Alert
    new_alert = SOSAlert(
        alert_id=generated_alert_id,
        user_id=current_user.id,
        emergency_type=alert_in.emergency_type,
        latitude=alert_in.latitude,
        longitude=alert_in.longitude,
        location=alert_in.location or nearest_office["name"],
        description=alert_in.description or f"SOS activated at {alert_in.location or 'Campus'}",
        status=AlertStatus.ACTIVE, # Mark as ACTIVE as requested
        escalation_level=2,  # Escalated immediately to Level 2 (Campus Security)
        nearest_security_office=nearest_office["name"],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    
    # Create Tracking info
    tracking = EmergencyTracking(
        alert_id=new_alert.id,
        assigned_officer="Officer Pending",
        current_status=AlertStatus.ACTIVE,
        eta_minutes=5,
        updated_at=datetime.utcnow()
    )
    db.add(tracking)
    db.commit()

    # Log in Audit Table
    log_audit(
        db, 
        current_user.id, 
        "TRIGGER_SOS", 
        f"SOS alert triggered. Alert ID: {generated_alert_id}. Location: {new_alert.location}. Proximity: {nearest_office['name']}"
    )

    # Format notification template
    # Example format matching requirements:
    google_maps_link = f"https://maps.google.com/?q={new_alert.latitude},{new_alert.longitude}"
    timestamp_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    msg_body = (
        f"🚨 EMERGENCY SOS ALERT 🚨\n\n"
        f"Student: {current_user.name}\n"
        f"Student ID: {current_user.id}\n"
        f"Emergency Type: {new_alert.emergency_type.value.upper()}\n"
        f"Location: {new_alert.location}\n"
        f"Timestamp: {timestamp_str}\n\n"
        f"Live Location:\n{google_maps_link}\n\n"
        f"Immediate assistance may be required."
    )

    # Retrieve all emergency contacts
    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).all()

    # Queue background notification dispatches
    for contact in contacts:
        # SMS Delivery
        background_tasks.add_task(
            send_twilio_notification, 
            db, new_alert.id, contact.phone_number, "SMS", msg_body
        )
        # WhatsApp Delivery
        background_tasks.add_task(
            send_twilio_notification, 
            db, new_alert.id, contact.phone_number, "WhatsApp", msg_body
        )
        
    # Campus security notification dispatch removed as requested

    # Broadcast WebSocket announcement to dashboards
    await broadcast_ws_update(db, new_alert.id, {
        "type": "new_alert",
        "alert_id": new_alert.alert_id,
        "student_name": current_user.name,
        "emergency_type": new_alert.emergency_type.value,
        "location": new_alert.location,
        "nearest_office": nearest_office["name"],
        "status": "active",
        "escalation_level": 2
    })
    
    return new_alert

@sos_router.get("/history", response_model=List[SOSResponseSchema])
def get_sos_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve chronological history of SOS alerts for the active student."""
    alerts = db.query(SOSAlert).filter(SOSAlert.user_id == current_user.id).order_by(SOSAlert.created_at.desc()).all()
    return alerts

@sos_router.get("/{id}", response_model=SOSResponseSchema)
def get_sos_details(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve specific SOS incident details.
    Allows retrieval by both database primary key ID (integer) or the alphanumeric alert_id.
    """
    query = db.query(SOSAlert)
    if id.isdigit():
        alert = query.filter(SOSAlert.id == int(id)).first()
    else:
        alert = query.filter(SOSAlert.alert_id == id).first()
        
    if not alert:
        raise HTTPException(status_code=404, detail="SOS Alert not found.")
        
    # Access control: user must own the alert, or be security/admin
    if alert.user_id != current_user.id and current_user.role.value not in ["security", "admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this incident report.")
        
    return alert

@sos_router.get("/live-status/{id}")
def get_live_status(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetches real-time status details of an alert:
    - Current alert state and escalation level
    - Security tracking details (assigned officer, ETA)
    - Notification logs & status (SMS/WhatsApp/Push)
    """
    query = db.query(SOSAlert)
    if id.isdigit():
        alert = query.filter(SOSAlert.id == int(id)).first()
    else:
        alert = query.filter(SOSAlert.alert_id == id).first()

    if not alert:
        raise HTTPException(status_code=404, detail="SOS Alert not found.")
        
    if alert.user_id != current_user.id and current_user.role.value not in ["security", "admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized access to this incident report.")

    # Retrieve tracking info
    tracking = db.query(EmergencyTracking).filter(EmergencyTracking.alert_id == alert.id).first()
    
    # Retrieve notification logs
    notif_logs = db.query(NotificationLog).filter(NotificationLog.sos_id == alert.id).all()
    
    logs_data = [
        {
            "id": log.id,
            "recipient": log.recipient,
            "channel": log.channel,
            "delivery_status": log.delivery_status,
            "provider_message_id": log.provider_message_id,
            "timestamp": log.timestamp
        }
        for log in notif_logs
    ]
    
    tracking_data = {
        "assigned_officer": tracking.assigned_officer if tracking else "Pending Assignment",
        "eta_minutes": tracking.eta_minutes if tracking else None,
        "current_status": tracking.current_status.value if tracking else alert.status.value,
        "updated_at": tracking.updated_at if tracking else alert.created_at
    }

    return {
        "id": alert.id,
        "alert_id": alert.alert_id,
        "status": alert.status.value,
        "escalation_level": alert.escalation_level,
        "nearest_security_office": alert.nearest_security_office,
        "created_at": alert.created_at,
        "tracking": tracking_data,
        "notifications": logs_data
    }

@sos_router.post("/{id}/escalate", response_model=SOSResponseSchema)
async def escalate_sos(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Escalates the active SOS alert workflow:
    - Increments escalation_level (e.g., Level 2 -> Level 3 Emergency Response Team).
    - Log event to audit tables.
    - Dispatches alerts via WebSocket.
    """
    query = db.query(SOSAlert)
    if id.isdigit():
        alert = query.filter(SOSAlert.id == int(id)).first()
    else:
        alert = query.filter(SOSAlert.alert_id == id).first()

    if not alert:
        raise HTTPException(status_code=404, detail="SOS Alert not found.")

    if alert.status in [AlertStatus.RESOLVED, AlertStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail="Cannot escalate a resolved or cancelled alert.")

    if alert.escalation_level >= 3:
        raise HTTPException(status_code=400, detail="Alert is already at the highest escalation level (ERT).")

    # Increment level
    alert.escalation_level = 3
    alert.updated_at = datetime.utcnow()
    db.commit()

    # Log in audit
    log_audit(
        db, 
        current_user.id, 
        "ESCALATE_SOS", 
        f"Alert {alert.alert_id} escalated to Level 3 (Emergency Response Team)."
    )

    # Broadcast escalation via WebSocket
    await broadcast_ws_update(db, alert.id, {
        "type": "escalation",
        "alert_id": alert.alert_id,
        "escalation_level": 3,
        "status": "Level 3 ERT Escalated"
    })

    return alert


# ---------------------------------------------------------
# 9. Notifications Endpoints (/api/notifications)
# ---------------------------------------------------------
class NotificationSendRequest(BaseModel):
    sos_id: int
    recipient: str
    channel: str = Field(..., description="SMS or WhatsApp")
    message: str

@notifications_router.post("/send", status_code=status.HTTP_201_CREATED)
async def send_manual_notification(
    payload: NotificationSendRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually retries/triggers a notification dispatch. Students can retry for their own alerts.
    """
    alert = db.query(SOSAlert).filter(SOSAlert.id == payload.sos_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Reference SOS Alert not found.")
    if alert.user_id != current_user.id and current_user.role.value not in ["security", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to send notifications for this alert.")

    normalized_phone = validate_and_normalize_phone(payload.recipient)

    background_tasks.add_task(
        send_twilio_notification,
        db,
        payload.sos_id,
        normalized_phone,
        payload.channel,
        payload.message
    )

    log_audit(
        db,
        current_user.id,
        "MANUAL_NOTIFICATION_DISPATCH",
        f"Manually queued {payload.channel} to {normalized_phone} for SOS ID {payload.sos_id}"
    )

    return {"message": "Notification dispatch scheduled in the background."}

@notifications_router.get("/history")
def get_notification_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves history logs of SMS/WhatsApp notifications sent.
    If the active user is a student, retrieves log details relating only to their own alerts.
    If the active user is security/admin, retrieves all logs.
    """
    if current_user.role.value in ["security", "admin"]:
        logs = db.query(NotificationLog).order_by(NotificationLog.timestamp.desc()).all()
    else:
        # Student: filter logs belonging to their alerts
        user_alerts = db.query(SOSAlert).filter(SOSAlert.user_id == current_user.id).with_entities(SOSAlert.id).all()
        alert_ids = [a[0] for a in user_alerts]
        logs = db.query(NotificationLog).filter(NotificationLog.sos_id.in_(alert_ids)).order_by(NotificationLog.timestamp.desc()).all()

    return [
        {
            "id": log.id,
            "sos_id": log.sos_id,
            "recipient": log.recipient,
            "channel": log.channel,
            "delivery_status": log.delivery_status,
            "provider_message_id": log.provider_message_id,
            "timestamp": log.timestamp
        }
        for log in logs
    ]

@notifications_router.post("/callback", status_code=status.HTTP_200_OK)
async def twilio_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Status callback webhook registered with Twilio to report message delivery states in real-time.
    Updates the delivery_status field in the database based on the unique MessageSid.
    """
    form_data = await request.form()
    message_sid = form_data.get("MessageSid")
    message_status = form_data.get("MessageStatus")  # e.g., 'sent', 'delivered', 'failed', 'undelivered'

    if not message_sid or not message_status:
        raise HTTPException(status_code=400, detail="Missing required callback form fields.")

    log = db.query(NotificationLog).filter(NotificationLog.provider_message_id == message_sid).first()
    if not log:
        logger.warn(f"Twilio callback received for unknown MessageSid: {message_sid}")
        return {"status": "ignored"}

    # Map status
    if message_status in ["delivered"]:
        status_str = "delivered"
    elif message_status in ["failed", "undelivered"]:
        status_str = "failed"
    else:
        status_str = "sent"

    log.delivery_status = status_str
    db.commit()

    logger.info(f"NotificationLog ID {log.id} updated to {status_str} via Twilio Callback.")
    
    # Broadcast status update via WebSocket
    await broadcast_ws_update(db, log.sos_id, {
        "type": "notification_status",
        "notification_id": log.id,
        "channel": log.channel,
        "recipient": log.recipient,
        "status": status_str,
        "provider_message_id": message_sid
    })

    return {"status": "success"}
