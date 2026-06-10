import re
from fastapi import FastAPI, status, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
from contextlib import asynccontextmanager
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# --- DATABASE ENGINE SETUP ---
DATABASE_URL = "sqlite:///./echo_campus.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- DATABASE TABLE MODEL ---
class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # Note: For production, hash passwords using bcrypt!
    role = Column(String, nullable=False)

# Ensure database tables are initialized
Base.metadata.create_all(bind=engine)

# --- APP LIFESPAN HANDLING (DATA SEEDING) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        # Check if the database table is completely empty
        if db.query(UserModel).count() == 0:
            demo_users = [
                UserModel(username="URK25CS7001", password="student123", role="Student"),
                UserModel(username="URK25CS7002", password="faculty123", role="Faculty"),
                UserModel(username="URK25CS7003", password="admin123", role="Administrator")
            ]
            db.add_all(demo_users)
            db.commit()
            print("Successfully initialized database and seeded default format accounts!")
    finally:
        db.close()
    yield

# --- API CORE SETUP ---
app = FastAPI(title="ECHO Smart Campus Governance API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SCHEMAS ---
class AuthRequest(BaseModel):
    username: str
    password: str
    role: str

# Dependency to fetch database session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- REGISTRATION ROUTE ---
@app.post("/api/register", status_code=status.HTTP_201_CREATED)
async def register(data: AuthRequest, db: Session = Depends(get_db)):
    # Regex breakdown for 'URK25CS7036': 
    # 3 uppercase letters, 2 digits, 2 uppercase letters, 4 digits
    REG_NUMBER_PATTERN = r"^[A-Z]{3}\d{2}[A-Z]{2}\d{4}$"
    
    if not re.match(REG_NUMBER_PATTERN, data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format. Username must be a standard registration number (e.g., URK25CS7036)."
        )
    
    # Check if registration number already exists in DB
    existing_user = db.query(UserModel).filter(UserModel.username == data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This registration number is already registered."
        )
    
    # Dynamically inject new user into SQLite database
    new_user = UserModel(username=data.username, password=data.password, role=data.role)
    db.add(new_user)
    db.commit()
    
    return {
        "success": True,
        "message": "Registration successful! You can now log in with your credentials."
    }

# --- DYNAMIC AUTHENTICATION ROUTE ---
@app.post("/api/login")
async def login(data: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == data.username).first()

    # Cross-check submitted info against dynamic database records
    if user and user.password == data.password and user.role == data.role:
        return {
            "success": True,
            "message": f"Welcome {user.username}! Login Successful as {user.role}."
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid Username, Password, or Role mapping."
    )

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)