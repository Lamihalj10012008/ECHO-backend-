import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Fetch database configuration from environment
# Fallback to SQLite local file database if postgres is not configured
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./echo_campus.db")

# SQLite needs connect_args check_same_thread=False
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Configure pooling for PostgreSQL
engine_args = {
    "pool_pre_ping": True,
}
if not DATABASE_URL.startswith("sqlite"):
    engine_args.update({
        "pool_size": 20,
        "max_overflow": 10,
        "pool_recycle": 1800,
    })

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    **engine_args
)

# Session configurations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base
Base = declarative_base()

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
