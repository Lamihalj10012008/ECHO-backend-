import datetime
from typing import Optional, Dict, Any
import jwt
import bcrypt
import pyotp
from cryptography.fernet import Fernet
from backend.app.config import settings

# Initialize Fernet cipher for database attribute encryption
fernet_cipher = Fernet(settings.FERNET_KEY.encode())

# --- PASSWORD HASHING ---
def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

# --- JWT TOKENS ---
def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Create a signed JWT refresh token."""
    to_encode = data.copy()
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
    """Decode and verify JWT token. Returns payload if valid."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except jwt.PyJWTError:
        return None

# --- DATABASE FIELD ENCRYPTION (FOR SECRETS) ---
def encrypt_secret(secret: str) -> str:
    """Encrypt a sensitive string using Fernet (symmetric encryption)."""
    return fernet_cipher.encrypt(secret.encode("utf-8")).decode("utf-8")

def decrypt_secret(encrypted_secret: str) -> str:
    """Decrypt a sensitive string using Fernet."""
    return fernet_cipher.decrypt(encrypted_secret.encode("utf-8")).decode("utf-8")

# --- MULTI-FACTOR AUTHENTICATION (TOTP) ---
def generate_totp_secret() -> str:
    """Generate a standard base32 MFA secret key."""
    return pyotp.random_base32()

def get_totp_uri(username: str, secret: str) -> str:
    """Generate TOTP URI for QR Code scanning."""
    return pyotp.totp.TOTP(secret).provisioning_uri(
        name=username,
        issuer_name=settings.MFA_ISSUER_NAME
    )

def verify_totp_code(secret: str, code: str) -> bool:
    """Verify submitted TOTP authentication code (with 30s drift allowance)."""
    totp = pyotp.totp.TOTP(secret)
    # valid_window=1 allows verification of codes 30 seconds before/after current time
    return totp.verify(code, valid_window=1)
