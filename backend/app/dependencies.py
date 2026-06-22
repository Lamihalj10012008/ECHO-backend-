from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import datetime
from backend.app.database import get_db
from backend.app.models import User, UserSession
from backend.app.security import verify_token

security_scheme = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to resolve the current active user from the JWT access token.
    Enforces expiration, active session check, and account lockout checks.
    """
    token = credentials.credentials
    payload = verify_token(token, token_type="access")
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials. Invalid or expired token."
        )
        
    user_id = payload.get("sub")
    session_id = payload.get("sid")
    
    if not user_id or not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials. Invalid payload."
        )
        
    # Check if session is still active in DB
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == user_id,
        UserSession.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked or expired. Please log in again."
        )
        
    # Fetch User
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )
        
    # Check Active status
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated."
        )
        
    # Check Account Lockout status
    if user.lockout_until and user.lockout_until > datetime.datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account is locked. Try again after {user.lockout_until}."
        )
        
    # Update last activity on session
    session.last_activity = datetime.datetime.utcnow()
    db.commit()
    
    return user

class PermissionChecker:
    """
    RBAC Permission gatekeeper dependency.
    """
    def __init__(self, required_permission: str):
        self.required_permission = required_permission
        
    def __call__(self, user: User = Depends(get_current_user)) -> User:
        # Check permissions through user's role
        role_permissions = [p.name for p in user.role.permissions]
        
        # Administrator role has super-user override permissions
        if user.role.name == "Administrator" or self.required_permission in role_permissions:
            return user
            
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have the necessary security clearance permissions for this resource."
        )
