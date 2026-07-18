from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from backend.config import settings
from backend.models import UserRole, UserInfo, ROLE_DISPLAY_NAMES, ROLE_COLORS, ROLE_EMOJIS

# ── OAuth2 Token Extraction ───────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> bytes:
    """Hash a password using bcrypt directly (avoids passlib compatibility issues)."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def verify_password(plain: str, hashed: bytes) -> bool:
    """Verify a plain password against a bcrypt hash."""
    if isinstance(hashed, str):
        hashed = hashed.encode("utf-8")
    return bcrypt.checkpw(plain.encode("utf-8"), hashed)


# ── Persistent User Store Integration ─────────────────────────────────────────
from backend.users_store import get_user_by_username, UserRecord


# ── JWT Token Operations ──────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── User Authentication ───────────────────────────────────────────────────────

def authenticate_user(username: str, password: str) -> Optional[UserRecord]:
    user = get_user_by_username(username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# ── FastAPI Dependency: Get Current User ──────────────────────────────────────

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInfo:
    payload = decode_token(token)
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = get_user_by_username(username)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return UserInfo(
        username=user.username,
        role=UserRole(user.role),
        display_name=ROLE_DISPLAY_NAMES[UserRole(user.role)],
        role_color=ROLE_COLORS[UserRole(user.role)],
        role_emoji=ROLE_EMOJIS[UserRole(user.role)],
    )


# ── FastAPI Dependency: Require Root/Admin Privileges ─────────────────────────

def require_root(current_user: UserInfo = Depends(get_current_user)) -> UserInfo:
    if current_user.role != UserRole.ROOT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required (Root role is required)",
        )
    return current_user
