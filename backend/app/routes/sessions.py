from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
import jwt
from backend.app.database import get_db
from backend.app.models import User, UserSession, RefreshToken
from backend.app.dependencies import get_current_user
from backend.app.schemas import SessionResponse
from backend.app.config import settings

router = APIRouter(prefix="/api/sessions", tags=["Session Management"])

@router.get("/active", response_model=List[SessionResponse])
async def get_active_sessions(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch all active sessions for the current user."""
    # We need to know which session is currently active for this request.
    # We extract the Authorization header token to find the sid.
    current_session_id = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            current_session_id = payload.get("sid")
        except Exception:
            pass

    sessions = db.query(UserSession).filter(
        UserSession.user_id == user.id,
        UserSession.is_active == True
    ).order_by(UserSession.last_activity.desc()).all()
    
    response_list = []
    for s in sessions:
        res = SessionResponse.from_orm(s)
        res.is_current = (s.id == current_session_id)
        response_list.append(res)
        
    return response_list

@router.post("/revoke/{session_id}")
async def revoke_session(
    session_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke a specific user session by setting is_active = False."""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found."
        )
        
    session.is_active = False
    
    # Revoke all associated refresh tokens
    db.query(RefreshToken).filter(
        RefreshToken.session_id == session_id
    ).update({"revoked": True})
    
    db.commit()
    return {"success": True, "message": "Session successfully revoked."}

@router.post("/logout-all")
async def logout_from_all_devices(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke all active sessions and refresh tokens for this user."""
    # Revoke sessions
    db.query(UserSession).filter(
        UserSession.user_id == user.id
    ).update({"is_active": False})
    
    # Revoke refresh tokens
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id
    ).update({"revoked": True})
    
    db.commit()
    return {"success": True, "message": "Successfully logged out from all devices."}
