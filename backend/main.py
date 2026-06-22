import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import Role, Permission, User, PasswordHistory
from backend.app.security import hash_password
from backend.app.middleware import SecurityHeadersMiddleware, RateLimitingMiddleware, CsrfProtectionMiddleware
from backend.app.config import settings

# --- API ROUTERS ---
from backend.app.routes.auth import router as auth_router
from backend.app.routes.mfa import router as mfa_router
from backend.app.routes.sessions import router as sessions_router
from backend.app.routes.admin import router as admin_router
from backend.app.routes.users import router as users_router

# Ensure tables are created
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle handler to seed Roles, Permissions, and default accounts on startup."""
    db = SessionLocal()
    try:
        # 1. Seed Permissions
        permissions_data = [
            ("view_dashboard", "Access to campus governance dashboard"),
            ("view_sessions", "View active logins"),
            ("revoke_session", "Invalidate active login sessions"),
            ("edit_grades", "Modify student grades and submissions"),
            ("view_audit_logs", "View administrative audit trails"),
            ("manage_users", "Deactivate/Activate users"),
            ("lock_user", "Manually lockout security threats"),
            ("unlock_user", "Manually restore account access")
        ]
        
        db_permissions = {}
        for p_name, p_desc in permissions_data:
            perm = db.query(Permission).filter(Permission.name == p_name).first()
            if not perm:
                perm = Permission(name=p_name, description=p_desc)
                db.add(perm)
                db.commit()
                db.refresh(perm)
            db_permissions[p_name] = perm
            
        # 2. Seed Roles and map permissions
        roles_data = {
            "Student": ["view_dashboard", "view_sessions", "revoke_session"],
            "Faculty": ["view_dashboard", "view_sessions", "revoke_session", "edit_grades"],
            "Administrator": ["view_dashboard", "view_sessions", "revoke_session", "view_audit_logs", "manage_users", "lock_user", "unlock_user"]
        }
        
        db_roles = {}
        for r_name, p_list in roles_data.items():
            role = db.query(Role).filter(Role.name == r_name).first()
            if not role:
                role = Role(name=r_name, description=f"{r_name} role permissions")
                db.add(role)
                db.commit()
                db.refresh(role)
                
            # Sync permissions to role
            role.permissions = [db_permissions[p] for p in p_list]
            db.commit()
            db_roles[r_name] = role

        # 3. Seed Default Accounts (with strong passwords!)
        demo_accounts = [
            ("URK25CS7001", "StudentPassword123!", "Student", "Alice Student", "cs_student@university.edu", "+1555010001", "Computer Science"),
            ("URK25CS7002", "FacultyPassword123!", "Faculty", "Bob Professor", "cs_faculty@university.edu", "+1555010002", "Computer Science"),
            ("URK25CS7003", "AdminPassword123!", "Administrator", "Charlie Admin", "admin@university.edu", "+1555010003", "IT Operations")
        ]
        
        for username, password, role_name, full_name, email, mobile, dept in demo_accounts:
            existing_user = db.query(User).filter(User.username == username).first()
            if not existing_user:
                pwd_hash = hash_password(password)
                new_user = User(
                    username=username,
                    full_name=full_name,
                    email=email,
                    mobile_number=mobile,
                    department=dept,
                    password_hash=pwd_hash,
                    role_id=db_roles[role_name].id,
                    is_active=True,
                    is_verified=True, # Pre-verified for testing
                    mfa_enabled=False
                )
                db.add(new_user)
                db.commit()
                db.refresh(new_user)
                
                # Also seed password history
                history_entry = PasswordHistory(
                    user_id=new_user.id,
                    password_hash=pwd_hash
                )
                db.add(history_entry)
                db.commit()
                
        print("Successfully initialized database schemas, roles, permissions, and seeded default accounts!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()
    yield

# --- APP SETUP ---
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan
)

# --- SECURITY MIDDLEWARE PIPELINE ---
# 1. Custom Security Headers (Clickjacking, MIME, CSP, HSTS)
app.add_middleware(SecurityHeadersMiddleware)

# 2. Rate Limiting Middleware (IP based brute-force protection)
app.add_middleware(RateLimitingMiddleware)

# 3. CSRF Protection Middleware (Origin and Referer checking)
app.add_middleware(CsrfProtectionMiddleware)

# 4. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTER REGISTER ---
app.include_router(auth_router)
app.include_router(mfa_router)
app.include_router(sessions_router)
app.include_router(admin_router)
app.include_router(users_router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8001, reload=True)