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


# ── In-Memory User Store ──────────────────────────────────────────────────────
# In production, replace with a proper database (PostgreSQL, etc.)

class User:
    def __init__(self, username: str, password: str, role: UserRole, full_name: str):
        self.username = username
        self.hashed_password = hash_password(password)
        self.role = role
        self.full_name = full_name
        self.is_active = True


# Demo users for each role
USERS_DB: dict[str, User] = {
    "alice_finance": User(
        username="alice_finance",
        password="finance123",
        role=UserRole.FINANCE,
        full_name="Alice Fernandez",
    ),
    "bob_marketing": User(
        username="bob_marketing",
        password="marketing123",
        role=UserRole.MARKETING,
        full_name="Bob Chatterjee",
    ),
    "carol_hr": User(
        username="carol_hr",
        password="hr123",
        role=UserRole.HR,
        full_name="Carol Raj",
    ),
    "dave_eng": User(
        username="dave_eng",
        password="eng123",
        role=UserRole.ENGINEERING,
        full_name="Dave Pillai",
    ),
    "tony_cto": User(
        username="tony_cto",
        password="executive123",
        role=UserRole.EXECUTIVE,
        full_name="Tony Sharma",
    ),
    "employee1": User(
        username="employee1",
        password="employee123",
        role=UserRole.EMPLOYEE,
        full_name="Rohan Kumar",
    ),
}


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

def authenticate_user(username: str, password: str) -> Optional[User]:
    user = USERS_DB.get(username)
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
    user = USERS_DB.get(username)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return UserInfo(
        username=user.username,
        role=user.role,
        display_name=ROLE_DISPLAY_NAMES[user.role],
        role_color=ROLE_COLORS[user.role],
        role_emoji=ROLE_EMOJIS[user.role],
    )
