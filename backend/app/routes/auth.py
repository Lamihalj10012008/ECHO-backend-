import uuid
import datetime
import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, Role, UserSession, RefreshToken, AuditLog, LoginAttempt, EmailVerificationToken, PasswordResetToken, PasswordHistory
from backend.app.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, RefreshTokenRequest, PasswordResetRequest, PasswordResetConfirm, UserResponse
from backend.app.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from backend.app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def log_audit(db: Session, user_id: Optional[int], action: str, details: str, ip: str, status_str: str):
    """Utility helper to record security audit logs."""
    log = AuditLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip,
        status=status_str
    )
    db.add(log)
    db.commit()

def verify_captcha(response_token: Optional[str]) -> bool:
    """Mock CAPTCHA validation. In production, connect to Google/Cloudflare."""
    if not response_token:
        return False
    return response_token == "mock_captcha_success_token" or response_token.startswith("valid_")

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: UserRegisterRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    
    # Verify CAPTCHA
    if not verify_captcha(data.captcha_token):
        log_audit(db, None, "REGISTRATION_FAILED", "CAPTCHA validation failed", client_ip, "FAILURE")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CAPTCHA security verification failed."
        )
    
    # Check duplicate account by registration number
    existing_user = db.query(User).filter(User.username == data.username).first()
    if existing_user:
        log_audit(db, None, "REGISTRATION_FAILED", f"Username {data.username} already exists", client_ip, "FAILURE")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This registration number is already registered."
        )

    # Check duplicate account by email
    existing_email = db.query(User).filter(User.email == data.email).first()
    if existing_email:
        log_audit(db, None, "REGISTRATION_FAILED", f"Email {data.email} already exists", client_ip, "FAILURE")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email address is already registered."
        )

    # Fetch role record
    role_record = db.query(Role).filter(Role.name == data.role).first()
    if not role_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Requested campus role does not exist."
        )

    # Hash password using bcrypt
    hashed_pwd = hash_password(data.password)
    
    # Create User
    new_user = User(
        username=data.username,
        full_name=data.full_name,
        email=data.email,
        mobile_number=data.mobile_number,
        department=data.department,
        password_hash=hashed_pwd,
        role_id=role_record.id,
        is_active=True,
        is_verified=False, # Must verify email
        mfa_enabled=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Seed initial password history
    new_history = PasswordHistory(
        user_id=new_user.id,
        password_hash=hashed_pwd
    )
    db.add(new_history)
    db.commit()
    
    # Generate verification token
    verification_token_str = secrets.token_urlsafe(32)
    verify_token_hash = hash_password(verification_token_str)
    
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    verification_record = EmailVerificationToken(
        token_hash=verify_token_hash,
        user_id=new_user.id,
        expires_at=expiry
    )
    db.add(verification_record)
    db.commit()

    # MOCK Email Sending: Output verification link to console log
    verification_url = f"http://127.0.0.1:5173/verify-email?token={verification_token_str}&username={new_user.username}"
    print(f"\n[MOCK EMAIL SENT TO {new_user.email}]\nVerify Account Link: {verification_url}\n")
    
    log_audit(db, new_user.id, "REGISTRATION_SUCCESS", f"Created user with role {data.role}", client_ip, "SUCCESS")
    
    return {
        "success": True,
        "message": "Registration successful! A verification link has been sent to your university email."
    }

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("User-Agent", "unknown")
    
    # 1. Query user by Registration Number (username) OR Email
    user = db.query(User).filter(
        (User.username == data.username.upper()) | (User.email == data.username.lower())
    ).first()
    
    username_key = user.username if user else data.username
    
    # 2. Check failed attempts for brute-force tracking
    attempt_record = db.query(LoginAttempt).filter(
        LoginAttempt.username == username_key
    ).first()
    
    if user and user.lockout_until and user.lockout_until > datetime.datetime.utcnow():
        log_audit(db, user.id, "LOGIN_FAILED", "Blocked due to account lockout", client_ip, "FAILURE")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is temporarily locked. Try again later."
        )

    # 3. Authenticate credentials
    if not user or not verify_password(data.password, user.password_hash) or user.role.name != data.role:
        # Increment failed login attempts
        if attempt_record:
            attempt_record.attempts += 1
            attempt_record.last_attempt_at = datetime.datetime.utcnow()
        else:
            attempt_record = LoginAttempt(
                username=username_key,
                attempts=1,
                last_attempt_at=datetime.datetime.utcnow()
            )
            db.add(attempt_record)
            
        # Lockout check
        if attempt_record.attempts >= settings.MAX_LOGIN_ATTEMPTS:
            lockout_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.LOCKOUT_MINUTES)
            if user:
                user.lockout_until = lockout_time
                db.add(user)
            log_audit(db, user.id if user else None, "ACCOUNT_LOCKED", "Locked out due to excessive failures", client_ip, "FAILURE")
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid credentials. Account locked for {settings.LOCKOUT_MINUTES} minutes."
            )
            
        db.commit()
        log_audit(db, user.id if user else None, "LOGIN_FAILED", "Invalid password/role mapping", client_ip, "FAILURE")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or role mapping."
        )

    # Login successful: Reset login attempts
    if attempt_record:
        db.delete(attempt_record)
        db.commit()

    # 4. Check if MFA (TOTP) is required
    if user.mfa_enabled:
        if not data.mfa_code:
            log_audit(db, user.id, "LOGIN_MFA_CHALLENGE", "MFA code requested", client_ip, "SUCCESS")
            # Return partial token for MFA checkpoint
            mfa_temp_token = create_access_token(
                {"sub": user.id, "sid": "mfa_pending", "mfa_pending": True},
                expires_delta=datetime.timedelta(minutes=5)
            )
            return TokenResponse(
                access_token=mfa_temp_token,
                refresh_token="",
                mfa_required=True
            )
            
        # Verify code
        from backend.app.security import verify_totp_code, decrypt_secret
        secret_record = user.mfa_secrets
        if not secret_record:
            raise HTTPException(status_code=400, detail="MFA Secret missing.")
            
        decrypted_secret = decrypt_secret(secret_record.secret_encrypted)
        
        # Verify TOTP code or check backup codes
        is_totp_valid = verify_totp_code(decrypted_secret, data.mfa_code)
        is_backup_valid = False
        
        if not is_totp_valid:
            # Check backup recovery codes
            import json
            backup_codes = json.loads(decrypt_secret(secret_record.backup_codes_encrypted))
            if data.mfa_code in backup_codes:
                is_backup_valid = True
                # Remove used backup code
                backup_codes.remove(data.mfa_code)
                secret_record.backup_codes_encrypted = encrypt_secret(json.dumps(backup_codes))
                db.add(secret_record)
                db.commit()
                
        if not is_totp_valid and not is_backup_valid:
            log_audit(db, user.id, "LOGIN_FAILED", "MFA verification failed", client_ip, "FAILURE")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Multi-Factor verification code."
            )

    # 5. Create active UserSession
    session_id = str(uuid.uuid4())
    new_session = UserSession(
        id=session_id,
        user_id=user.id,
        user_agent=user_agent,
        ip_address=client_ip,
        device_fingerprint=data.device_fingerprint,
        is_active=True
    )
    db.add(new_session)
    db.commit()
    
    # 6. Generate and save Refresh Token
    refresh_token_str = secrets.token_urlsafe(32)
    ref_token_hash = hash_password(refresh_token_str)
    
    # Check remember me parameter
    days_expiry = 30 if data.remember_me else settings.REFRESH_TOKEN_EXPIRE_DAYS
    refresh_expiry = datetime.datetime.utcnow() + datetime.timedelta(days=days_expiry)
    new_ref_token = RefreshToken(
        token_hash=ref_token_hash,
        user_id=user.id,
        session_id=session_id,
        expires_at=refresh_expiry
    )
    db.add(new_ref_token)
    db.commit()
    
    # 7. Generate JWT access and refresh tokens
    access_token = create_access_token({
        "sub": user.id,
        "username": user.username,
        "role": user.role.name,
        "sid": session_id
    })
    
    # Send the raw string tokens to user
    jwt_refresh_token = create_refresh_token({
        "sub": user.id,
        "sid": session_id,
        "raw_token": refresh_token_str
    }, expires_delta=datetime.timedelta(days=days_expiry))
    
    log_audit(db, user.id, "LOGIN_SUCCESS", "Successfully logged in", client_ip, "SUCCESS")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=jwt_refresh_token,
        mfa_required=False
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    # Decode refresh token
    payload = verify_token(data.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )
        
    user_id = payload.get("sub")
    session_id = payload.get("sid")
    raw_token = payload.get("raw_token")
    
    # Resolve user
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not active.")
        
    # Check if session is active
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.is_active == True
    ).first()
    if not session:
        raise HTTPException(status_code=401, detail="Session revoked.")
        
    # Check token in database
    # Since we rotate tokens, we check if the token hash matches
    db_tokens = db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.session_id == session_id,
        RefreshToken.revoked == False
    ).all()
    
    matched_token = None
    for t in db_tokens:
        if verify_password(raw_token, t.token_hash):
            matched_token = t
            break
            
    if not matched_token or matched_token.expires_at < datetime.datetime.utcnow():
        # Suspected Token Reuse Hijacking! Revoke all tokens/sessions for this user
        if not matched_token:
            db.query(RefreshToken).filter(RefreshToken.session_id == session_id).update({"revoked": True})
            db.query(UserSession).filter(UserSession.id == session_id).update({"is_active": False})
            db.commit()
            log_audit(db, user_id, "TOKEN_HIJACKING_ALERT", f"Attempted reuse of refresh token in session {session_id}", "unknown", "FAILURE")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token session context."
        )
        
    # Token rotation: Revoke old token
    matched_token.revoked = True
    db.commit()
    
    # Generate new refresh token
    new_refresh_str = secrets.token_urlsafe(32)
    new_ref_hash = hash_password(new_refresh_str)
    
    new_ref_expiry = datetime.datetime.utcnow() + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    new_ref_record = RefreshToken(
        token_hash=new_ref_hash,
        user_id=user.id,
        session_id=session_id,
        expires_at=new_ref_expiry
    )
    db.add(new_ref_record)
    
    # Generate new access token
    new_access_token = create_access_token({
        "sub": user.id,
        "username": user.username,
        "role": user.role.name,
        "sid": session_id
    })
    
    new_refresh_jwt = create_refresh_token({
        "sub": user.id,
        "sid": session_id,
        "raw_token": new_refresh_str
    })
    
    db.commit()
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_jwt
    )

@router.post("/verify-email")
async def verify_email(token: str, username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username.upper()).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request context.")
        
    tokens = db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == user.id,
        EmailVerificationToken.is_used == False,
        EmailVerificationToken.expires_at > datetime.datetime.utcnow()
    ).all()
    
    matched_token = None
    for t in tokens:
        if verify_password(token, t.token_hash):
            matched_token = t
            break
            
    if not matched_token:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token.")
        
    matched_token.is_used = True
    user.is_verified = True
    db.commit()
    
    log_audit(db, user.id, "EMAIL_VERIFICATION_SUCCESS", "Email successfully verified", "unknown", "SUCCESS")
    
    return {"success": True, "message": "Your email has been successfully verified! You can now log in."}

@router.post("/forgot-password")
async def forgot_password(data: PasswordResetRequest, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    user = db.query(User).filter(User.email == data.email.lower()).first()
    
    # Prevent email enumeration: return success even if user not found!
    if not user:
        return {"success": True, "message": "If the account exists, a reset link has been dispatched."}
        
    # Generate one-time reset token
    reset_token_str = secrets.token_urlsafe(32)
    reset_token_hash = hash_password(reset_token_str)
    
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    reset_record = PasswordResetToken(
        token_hash=reset_token_hash,
        user_id=user.id,
        expires_at=expiry
    )
    db.add(reset_record)
    db.commit()
    
    # MOCK Email Sending: Output reset link to console log
    reset_url = f"http://127.0.0.1:5173/reset-password?token={reset_token_str}&username={user.username}"
    print(f"\n[MOCK EMAIL SENT TO {user.email}]\nReset Password Link: {reset_url}\n")
    
    log_audit(db, user.id, "PASSWORD_RESET_REQUESTED", "Password reset token generated", client_ip, "SUCCESS")
    
    return {"success": True, "message": "If the account exists, a reset link has been dispatched."}

@router.post("/reset-password")
async def reset_password(data: PasswordResetConfirm, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    
    # Verify token
    active_tokens = db.query(PasswordResetToken).filter(
        PasswordResetToken.is_used == False,
        PasswordResetToken.expires_at > datetime.datetime.utcnow()
    ).all()
    
    matched_token = None
    for t in active_tokens:
        if verify_password(data.token, t.token_hash):
            matched_token = t
            break
            
    if not matched_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
        
    user = db.query(User).filter(User.id == matched_token.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")
        
    # Password history validation: Check if matching recently used passwords
    history = db.query(PasswordHistory).filter(
        PasswordHistory.user_id == user.id
    ).order_by(PasswordHistory.created_at.desc()).limit(settings.PASSWORD_HISTORY_LIMIT).all()
    
    for h in history:
        if verify_password(data.new_password, h.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password cannot be one of your recently used passwords."
            )
            
    # Check if matching current password (fallback)
    if verify_password(data.new_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as your current password."
        )
        
    # Reset password
    hashed_pwd = hash_password(data.new_password)
    user.password_hash = hashed_pwd
    user.lockout_until = None # Reset lockout
    matched_token.is_used = True
    
    # Save to history
    new_history = PasswordHistory(
        user_id=user.id,
        password_hash=hashed_pwd
    )
    db.add(new_history)
    
    # Revoke all current sessions/tokens for safety after password change
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).update({"revoked": True})
    db.query(UserSession).filter(UserSession.user_id == user.id).update({"is_active": False})
    
    db.commit()
    
    log_audit(db, user.id, "PASSWORD_RESET_SUCCESS", "Password reset completed successfully", client_ip, "SUCCESS")
    
    return {"success": True, "message": "Password updated successfully. You can now log in with your new credentials."}
