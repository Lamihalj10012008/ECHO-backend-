import os
import base64
from typing import List

class Settings:
    # App General Settings
    PROJECT_NAME: str = "ECHO Smart Campus Governance API"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
        "http://localhost:5177",
        "http://127.0.0.1:5177",
        "http://localhost:5178",
        "http://127.0.0.1:5178",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/echo_campus")
    
    # Password History Limit
    PASSWORD_HISTORY_LIMIT: int = 3
    
    # JWT & Cryptographic configurations
    # Production note: generate via `openssl rand -hex 32`
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecret-jwt-key-92842048-28942-83210-4821")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Encryption key for storing TOTP secrets and backup codes in database
    # Must be a 32-byte base64-encoded key
    # Default is base64 key generated for: b"echo_secret_fernet_key_32bytes_1!"
    FERNET_KEY: str = os.getenv(
        "FERNET_KEY", 
        base64.urlsafe_b64encode(b"echo_secret_fernet_key_32bytes_1").decode()
    )

    # Brute Force / Account Lockout Settings
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_MINUTES: int = 15
    
    # OTP/MFA settings
    MFA_ISSUER_NAME: str = "ECHO-Campus"

    # CAPTCHA verification config (Google reCAPTCHA or similar mock keys)
    CAPTCHA_SECRET: str = os.getenv("CAPTCHA_SECRET", "mock_captcha_secret_key")
    
    # SMTP email configuration for mock/real email sending
    SMTP_HOST: str = os.getenv("SMTP_HOST", "localhost")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "1025"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "no-reply@echo.edu")

settings = Settings()
