"""Utility functions"""

from datetime import datetime
import re
from typing import Optional

def is_valid_email(email: str) -> bool:
    """Validate email address"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_phone(phone: str) -> bool:
    """Validate phone number"""
    # Remove common separators
    cleaned = re.sub(r'[\s\-\.\(\)]', '', phone)
    # Check if it contains only digits and has reasonable length
    return re.match(r'^\d{10,}$', cleaned) is not None

def format_phone(phone: str) -> str:
    """Format phone number to standard format"""
    cleaned = re.sub(r'[\s\-\.\(\)]', '', phone)
    return cleaned

def get_distance_between_points(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    from math import radians, cos, sin, asin, sqrt
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    km = 6371 * c
    return km

def get_relative_time(dt: datetime) -> str:
    """Get relative time string"""
    now = datetime.utcnow()
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes}m ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours}h ago"
    elif seconds < 604800:
        days = int(seconds / 86400)
        return f"{days}d ago"
    else:
        weeks = int(seconds / 604800)
        return f"{weeks}w ago"

def generate_report_filename(alert_id: str) -> str:
    """Generate report filename"""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return f"alert_{alert_id}_{timestamp}.pdf"

class AlertIDGenerator:
    """Generate unique alert IDs"""
    
    @staticmethod
    def generate() -> str:
        """Generate unique alert ID"""
        import uuid
        return f"SOS{uuid.uuid4().hex[:8].upper()}"
