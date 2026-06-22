from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime
from backend.app.database import get_db
from backend.app.models import User, AuditLog, LoginAttempt, Role
from backend.app.dependencies import get_current_user, PermissionChecker
from backend.app.schemas import AuditLogResponse, UserResponse

router = APIRouter(prefix="/api/admin", tags=["Administration"])

# Helper function to check if the user is an Administrator
def require_admin(user: User = Depends(get_current_user)):
    if user.role.name != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return user

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve system security audit logs. Restructured to join with users."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
    
    response_list = []
    for log in logs:
        # Load username
        username = log.user.username if log.user else "Anonymous"
        res = AuditLogResponse(
            id=log.id,
            username=username,
            action=log.action,
            details=log.details,
            ip_address=log.ip_address,
            status=log.status,
            created_at=log.created_at
        )
        response_list.append(res)
        
    return response_list

@router.get("/users", response_model=List[UserResponse])
async def get_users_list(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve all users in the portal."""
    users = db.query(User).all()
    return users

@router.post("/users/{username}/lock")
async def lock_user_account(
    username: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Manually lock a user's account for administrative reasons (e.g. security block)."""
    user = db.query(User).filter(User.username == username.upper()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    # Lock for 24 hours
    user.lockout_until = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    db.commit()
    
    # Audit log
    audit_entry = AuditLog(
        user_id=user.id,
        action="MANUAL_LOCKOUT",
        details=f"Locked manually by Administrator {admin.username} for 24 hours",
        ip_address="internal",
        status="SUCCESS"
    )
    db.add(audit_entry)
    db.commit()
    
    return {"success": True, "message": f"Account for {username} is locked for 24 hours."}

@router.post("/users/{username}/unlock")
async def unlock_user_account(
    username: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Unlock a user's account and reset login attempts."""
    user = db.query(User).filter(User.username == username.upper()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    user.lockout_until = None
    
    # Also clean up brute-force attempts
    db.query(LoginAttempt).filter(LoginAttempt.username == username.upper()).delete()
    
    # Audit log
    audit_entry = AuditLog(
        user_id=user.id,
        action="MANUAL_UNLOCK",
        details=f"Unlocked manually by Administrator {admin.username}",
        ip_address="internal",
        status="SUCCESS"
    )
    db.add(audit_entry)
    db.commit()
    
    return {"success": True, "message": f"Account for {username} has been unlocked."}
