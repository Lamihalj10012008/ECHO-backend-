"""
ECHO SOS Alert System Backend
Main FastAPI Application
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.routes import auth, sos_alerts, contacts, notifications, tracking, events, sos_enhanced
from app.middleware.error_handler import error_handler_middleware
from app.websocket.manager import ConnectionManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

# Run SQLite table migrations for enhanced features
def run_migrations():
    from app.core.database import SessionLocal
    from sqlalchemy import text
    db = SessionLocal()
    try:
        # Check and alter sos_alerts table
        try:
            db.execute(text("ALTER TABLE sos_alerts ADD COLUMN escalation_level INTEGER DEFAULT 1"))
            db.commit()
            logger.info("Migrated: added escalation_level to sos_alerts")
        except Exception:
            db.rollback()
        
        try:
            db.execute(text("ALTER TABLE sos_alerts ADD COLUMN nearest_security_office VARCHAR(255)"))
            db.commit()
            logger.info("Migrated: added nearest_security_office to sos_alerts")
        except Exception:
            db.rollback()
            
        # Check and alter notification_logs table
        try:
            db.execute(text("ALTER TABLE notification_logs ADD COLUMN provider_message_id VARCHAR(100)"))
            db.commit()
            logger.info("Migrated: added provider_message_id to notification_logs")
        except Exception:
            db.rollback()
            
    except Exception as e:
        logger.error(f"Error during migration: {e}")
    finally:
        db.close()

run_migrations()

# Seed initial users
from app.core.database import SessionLocal
from app.models import User, UserRole, EmergencyContact
from app.auth.utils import hash_password

db = SessionLocal()
try:
    smith = db.query(User).filter(User.email == "smith@echo.campus").first()
    if not smith:
        db.add(User(
            name="Dr. Smith",
            email="smith@echo.campus",
            phone="1234567890",
            hashed_password=hash_password("password"),
            role=UserRole.FACULTY,
            is_active=True
        ))
    else:
        smith.hashed_password = hash_password("password")
        smith.name = "Dr. Smith"
        smith.role = UserRole.FACULTY
        smith.is_active = True

    admin = db.query(User).filter(User.email == "admin@echo.campus").first()
    if not admin:
        db.add(User(
            name="Admin Office",
            email="admin@echo.campus",
            phone="0987654321",
            hashed_password=hash_password("password"),
            role=UserRole.ADMIN,
            is_active=True
        ))
    else:
        admin.hashed_password = hash_password("password")
        admin.name = "Admin Office"
        admin.role = UserRole.ADMIN
        admin.is_active = True

    andrea = db.query(User).filter(User.email == "andrea.susanna07@gmail.com").first()
    if not andrea:
        db.add(User(
            name="Andrea Susanna",
            email="andrea.susanna07@gmail.com",
            phone="1122334455",
            hashed_password=hash_password("password"),
            role=UserRole.STUDENT,
            is_active=True
        ))
    else:
        andrea.hashed_password = hash_password("password")
        andrea.name = "Andrea Susanna"
        andrea.role = UserRole.STUDENT
        andrea.is_active = True
        
    db.commit()

    # Seed contacts for smith
    if smith:
        existing_contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == smith.id).all()
        if not existing_contacts:
            db.add(EmergencyContact(user_id=smith.id, contact_name="Parent (Father)", phone_number="9789580841", relationship="Parent"))
            db.add(EmergencyContact(user_id=smith.id, contact_name="Guardian (Uncle)", phone_number="+91-9876543211", relationship="Guardian"))
    
    # Seed contacts for admin
    if admin:
        existing_contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == admin.id).all()
        if not existing_contacts:
            db.add(EmergencyContact(user_id=admin.id, contact_name="Parent (Mother)", phone_number="9789580841", relationship="Parent"))
            db.add(EmergencyContact(user_id=admin.id, contact_name="Guardian", phone_number="+91-9876543211", relationship="Guardian"))

    # Seed contacts for andrea
    if andrea:
        existing_contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == andrea.id).all()
        if not existing_contacts:
            db.add(EmergencyContact(user_id=andrea.id, contact_name="Parent (Father)", phone_number="9789580841", relationship="Parent"))
            db.add(EmergencyContact(user_id=andrea.id, contact_name="Guardian (Uncle)", phone_number="+91-9876543211", relationship="Guardian"))
            
    db.commit()
except Exception as e:
    logger.error(f"Error seeding database: {e}")
finally:
    db.close()

# WebSocket Connection Manager
ws_manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-ready SOS Alert System for ECHO Smart Campus Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.echo.campus"]
)

# Custom Error Handler Middleware
app.middleware("http")(error_handler_middleware)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ECHO SOS Alert System Backend",
        "version": settings.APP_VERSION,
        "status": "active"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

# API v1 Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(sos_alerts.router, prefix="/api/v1/sos", tags=["SOS Alerts"])
app.include_router(contacts.router, prefix="/api/v1/contacts", tags=["Emergency Contacts"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(tracking.router, prefix="/api/v1/tracking", tags=["Tracking"])
app.include_router(events.router, prefix="/api/v1/events", tags=["Academic & Event Coordination"])

# New API Routes without v1 prefix to support exact paths requested
app.include_router(sos_enhanced.contacts_router, prefix="/api/contacts", tags=["Enhanced Contacts"])
app.include_router(sos_enhanced.sos_router, prefix="/api/sos", tags=["Enhanced SOS"])
app.include_router(sos_enhanced.notifications_router, prefix="/api/notifications", tags=["Enhanced Notifications"])

# WebSocket endpoint
@app.websocket("/ws/alerts/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time alert updates"""
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.broadcast(f"User {user_id}: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id)
        await ws_manager.broadcast(f"User {user_id} disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
