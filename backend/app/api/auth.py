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
    ROLE_DISPLAY_NAMES,
    ROLE_COLORS,
    ROLE_EMOJIS,
)

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

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        display_name=ROLE_DISPLAY_NAMES.get(user.role, user.role),
        username=user.username,
        role_color=ROLE_COLORS.get(user.role, "#94a3b8"),
        role_emoji=ROLE_EMOJIS.get(user.role, "👤"),
    )


@router.get("/me", response_model=UserInfo)
async def get_me(current_user: UserInfo = Depends(get_current_user)):
    """Return current authenticated user's info and role."""
    return current_user
