from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./lostfound.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


class LostItem(Base):
    __tablename__ = "lost_items"

    id              = Column(Integer, primary_key=True, index=True)
    item_name       = Column(String, nullable=False)
    description     = Column(String)
    category        = Column(String, nullable=False)
    location        = Column(String, nullable=False)
    date_lost       = Column(String)
    time_lost       = Column(String)
    location_detail = Column(String)
    image_name      = Column(String)
    confidence      = Column(String, default="0%")
    status          = Column(String, default="Lost")
    reported_by     = Column(String)
    created_at      = Column(String)


class FoundItem(Base):
    __tablename__ = "found_items"

    id               = Column(Integer, primary_key=True, index=True)
    item_name        = Column(String, nullable=False)
    description      = Column(String)
    category         = Column(String, nullable=False)
    location         = Column(String, nullable=False)
    date_found       = Column(String)
    additional_notes = Column(String)
    image_name       = Column(String)
    status           = Column(String, default="Found")
    reported_by      = Column(String)
    created_at       = Column(String)


class ItemMatch(Base):
    __tablename__ = "item_matches"

    id            = Column(Integer, primary_key=True, index=True)
    lost_item_id  = Column(Integer)
    found_item_id = Column(Integer)
    confidence    = Column(Float)
    match_method  = Column(String)
    status        = Column(String, default="pending")   # pending | accepted | rejected
    created_at    = Column(String)


class SupportRequest(Base):
    __tablename__ = "support_requests"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(String)
    mentor_id  = Column(Integer, default=1)
    message    = Column(String)
    urgency    = Column(String, default="medium")   # low | medium | high
    status     = Column(String, default="pending")  # pending | seen | resolved
    created_at = Column(String)


class MeetingSchedule(Base):
    __tablename__ = "meeting_schedules"

    id             = Column(Integer, primary_key=True, index=True)
    student_id     = Column(String)
    mentor_id      = Column(Integer, default=1)
    preferred_date = Column(String)
    preferred_time = Column(String)
    topic          = Column(String)
    status         = Column(String, default="pending")  # pending | confirmed | cancelled
    created_at     = Column(String)
