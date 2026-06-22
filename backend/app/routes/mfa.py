import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import MfaSecret, User
from backend.app.dependencies import get_current_user
from backend.app.security import generate_totp_secret, get_totp_uri, verify_totp_code, encrypt_secret, decrypt_secret
from backend.app.schemas import MfaEnrollResponse, MfaVerificationRequest

router = APIRouter(prefix="/api/mfa", tags=["Multi-Factor Authentication"])

def get_qr_code_uri(uri: str) -> str:
    """
    Generate QR code image in Base64 using qrcode library.
    Falls back to a standard canvas placeholder if qrcode is not installed.
    """
    try:
        import qrcode
        import io
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        import base64
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    except ImportError:
        # Fallback to returning raw uri or public chart generator (mocked locally)
        import urllib.parse
        encoded_uri = urllib.parse.quote(uri)
        return f"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={encoded_uri}"

@router.post("/enroll", response_model=MfaEnrollResponse)
async def enroll_mfa(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Step 1: Initiate MFA enrollment.
    Generates a TOTP secret and backup codes. Saves it but doesn't activate yet.
    """
    # Check if MFA is already active
    if user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Multi-Factor Authentication is already active on this account."
        )
        
    secret = generate_totp_secret()
    totp_uri = get_totp_uri(user.username, secret)
    qr_code_uri = get_qr_code_uri(totp_uri)
    
    # Generate 8 backup recovery codes (each 10 chars long)
    import secrets
    import string
    backup_codes = []
    for _ in range(8):
        code = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(10))
        backup_codes.append(code)
        
    # Encrypt secret and backup codes using Fernet before saving
    encrypted_secret = encrypt_secret(secret)
    encrypted_backup = encrypt_secret(json.dumps(backup_codes))
    
    # Save/Update in MfaSecret
    mfa_record = db.query(MfaSecret).filter(MfaSecret.user_id == user.id).first()
    if mfa_record:
        mfa_record.secret_encrypted = encrypted_secret
        mfa_record.backup_codes_encrypted = encrypted_backup
    else:
        mfa_record = MfaSecret(
            user_id=user.id,
            secret_encrypted=encrypted_secret,
            backup_codes_encrypted=encrypted_backup
        )
        db.add(mfa_record)
        
    db.commit()
    
    return MfaEnrollResponse(
        secret=secret,
        qr_code_data_uri=qr_code_uri,
        backup_codes=backup_codes
    )

@router.post("/verify")
async def verify_and_activate_mfa(data: MfaVerificationRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Step 2: Confirm MFA enrollment by verifying a code.
    If valid, sets user.mfa_enabled = True.
    """
    # Fetch MFA Record
    mfa_record = db.query(MfaSecret).filter(MfaSecret.user_id == user.id).first()
    if not mfa_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA setup has not been initiated. Please call /enroll first."
        )
        
    # Decrypt secret
    decrypted_secret = decrypt_secret(mfa_record.secret_encrypted)
    
    # Verify TOTP code
    if not verify_totp_code(decrypted_secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA verification code. TOTP check failed."
        )
        
    # Activate MFA
    user.mfa_enabled = True
    db.add(user)
    db.commit()
    
    return {
        "success": True,
        "message": "Multi-Factor Authentication has been successfully activated!"
    }

@router.post("/disable")
async def disable_mfa(data: MfaVerificationRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Disable MFA. Requires verification of a code for security.
    """
    if not user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already disabled."
        )
        
    mfa_record = db.query(MfaSecret).filter(MfaSecret.user_id == user.id).first()
    if not mfa_record:
        raise HTTPException(status_code=400, detail="MFA Secret record not found.")
        
    decrypted_secret = decrypt_secret(mfa_record.secret_encrypted)
    
    if not verify_totp_code(decrypted_secret, data.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid MFA code. Cannot disable MFA."
        )
        
    # Disable
    user.mfa_enabled = False
    db.delete(mfa_record)
    db.add(user)
    db.commit()
    
    return {
        "success": True,
        "message": "Multi-Factor Authentication has been deactivated."
    }
