"""
Authentication endpoints: login and user profile.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from backend.app.core.config import settings
from backend.app.core.security import authenticate_user, create_access_token, get_current_user
from backend.app.models.schemas import (
    TokenResponse,
    UserInfo,
)
from backend.app.db.roles_store import get_role_by_id

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user with username/password.
    Returns a JWT access token and the user's role information.
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    role_rec = get_role_by_id(role_str)
    display_name = role_rec.name if role_rec else (user.full_name or role_str.title())
    role_color = role_rec.color if role_rec else "#3b82f6"

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=role_str,
        display_name=display_name,
        username=user.username,
        role_color=role_color,
    )


@router.get("/me", response_model=UserInfo)
async def get_me(current_user: UserInfo = Depends(get_current_user)):
    """Return current authenticated user's info and role."""
    return current_user
