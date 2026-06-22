"""Academic & Event Coordination routes"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from app.core.database import get_db
from app.schemas import EventCreate, EventReview, EventResponse
from app.auth.utils import get_current_user
from app.models import Event, User, UserRole, EventStatus

router = APIRouter()

def check_academic_event_conflicts(
    db: Session, 
    venue: str, 
    event_date: datetime, 
    exclude_event_id: Optional[int] = None
) -> bool:
    """
    Simulates the 'Academic & Event Coordination Agent'.
    Checks if there are any existing approved or pending events at the same venue 
    within a 2-hour window of the proposed event_date.
    """
    start_window = event_date - timedelta(hours=2)
    end_window = event_date + timedelta(hours=2)
    
    query = db.query(Event).filter(
        Event.venue == venue,
        Event.event_date.between(start_window, end_window),
        Event.status != EventStatus.REJECTED
    )
    
    if exclude_event_id:
        query = query.filter(Event.id != exclude_event_id)
        
    conflict_event = query.first()
    return conflict_event is not None

@router.post("/create", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows Faculty to submit a new event request.
    Simulates conflict check with Academic & Event Coordination Agent.
    """
    if current_user.role not in [UserRole.FACULTY, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only faculty members can submit event requests."
        )
        
    # Agent conflict validation check
    has_conflict = check_academic_event_conflicts(db, event_data.venue, event_data.event_date)
    if has_conflict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Venue conflict: Academic & Event Coordination Agent detected another event scheduled at '{event_data.venue}' within a 2-hour window of the requested time."
        )
        
    db_event = Event(
        title=event_data.title,
        description=event_data.description,
        organizer_id=current_user.id,
        department=event_data.department,
        event_date=event_data.event_date,
        venue=event_data.venue,
        expected_attendees=event_data.expected_attendees,
        status=EventStatus.PENDING
    )
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/pending", response_model=List[EventResponse])
async def get_pending_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows Administrators to fetch all pending requests.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Only administrators can view pending requests."
        )
        
    pending_events = db.query(Event).filter(Event.status == EventStatus.PENDING).order_by(Event.event_date.asc()).all()
    return pending_events

@router.put("/{event_id}/review", response_model=EventResponse)
async def review_event(
    event_id: int,
    review_data: EventReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows Administrators to update status to 'Approved' or 'Rejected' with an optional review comment.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Only administrators can approve/reject requests."
        )
        
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event request not found."
        )
        
    # Check for conflicts again if approving (in case of double bookings submitted concurrently)
    if review_data.status == EventStatus.APPROVED:
        has_conflict = check_academic_event_conflicts(db, db_event.venue, db_event.event_date, exclude_event_id=event_id)
        if has_conflict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Venue conflict: Academic & Event Coordination Agent detected another event scheduled at '{db_event.venue}' around this time."
            )
            
    db_event.status = review_data.status
    db_event.review_comment = review_data.review_comment
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/all", response_model=List[EventResponse])
async def get_all_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows Faculty and Admin to view all submitted events.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.FACULTY]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators and faculty can list all events."
        )
    return db.query(Event).order_by(Event.event_date.desc()).all()
