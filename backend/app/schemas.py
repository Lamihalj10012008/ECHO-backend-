import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List
from datetime import datetime

class UserRegisterRequest(BaseModel):
    username: str = Field(..., description="University registration number, e.g., URK25CS7036")
    full_name: str = Field(..., description="Full Name")
    email: str = Field(..., description="University Email Address")
    mobile_number: str = Field(..., description="Mobile Number")
    department: str = Field(..., description="Department, e.g., Computer Science")
    password: str = Field(..., min_length=12, description="Strong password, min 12 characters")
    confirm_password: str = Field(..., description="Confirm Password")
    role: str = Field(..., description="Role: Student, Faculty, or Administrator")
    captcha_token: Optional[str] = Field(None, description="CAPTCHA verification token")

    @field_validator("username")
    @classmethod
    def validate_registration_number(cls, v: str) -> str:
        # Regex breakdown for 'URK25CS7036': 
        # 3 uppercase letters, 2 digits, 2 uppercase letters, 4 digits
        pattern = r"^[A-Z]{3}\d{2}[A-Z]{2}\d{4}$"
        if not re.match(pattern, v.upper()):
            raise ValueError("Invalid format. Username must be a standard registration number (e.g., URK25CS7036).")
        return v.upper()

    @field_validator("email")
    @classmethod
    def validate_university_email(cls, v: str) -> str:
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?:edu|ac)(?:\.[a-zA-Z]{2,})?$"
        if not re.match(pattern, v.lower()):
            raise ValueError("Invalid email format. Must be a valid university email ending in .edu or .ac (e.g., name@university.edu, name@karunya.edu.in).")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_strong_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = ["Student", "Faculty", "Administrator"]
        if v not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v

    @model_validator(mode="after")
    def passwords_match(self) -> "UserRegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self

class UserLoginRequest(BaseModel):
    username: str # Email or Registration Number
    password: str
    role: str
    mfa_code: Optional[str] = None
    device_fingerprint: Optional[str] = None
    remember_me: Optional[bool] = False

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    mfa_required: bool = False

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_strong_password(cls, v: str) -> str:
        if len(v) < 12:
            raise ValueError("Password must be at least 12 characters.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v

class MfaEnrollResponse(BaseModel):
    secret: str
    qr_code_data_uri: str # Base64 SVG or PNG
    backup_codes: List[str]

class MfaVerificationRequest(BaseModel):
    code: str

class UserResponse(BaseModel):
    username: str
    role: str
    is_verified: bool
    mfa_enabled: bool
    full_name: Optional[str] = None
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    department: Optional[str] = None

    @field_validator("role", mode="before")
    @classmethod
    def get_role_name(cls, v):
        if hasattr(v, "name"):
            return v.name
        return v

    class Config:
        from_attributes = True

class SessionResponse(BaseModel):
    id: str
    user_agent: Optional[str]
    ip_address: Optional[str]
    last_activity: datetime
    is_active: bool
    is_current: bool = False

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    username: Optional[str]
    action: str
    details: Optional[str]
    ip_address: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
