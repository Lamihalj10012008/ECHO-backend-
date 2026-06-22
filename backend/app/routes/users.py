from fastapi import APIRouter, Depends
from backend.app.dependencies import get_current_user
from backend.app.models import User
from backend.app.schemas import UserResponse

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: User = Depends(get_current_user)):
    """Fetch profile data of the currently logged in user."""
    return user
