"""
FinSolve Technologies — RAG RBAC Chatbot
Pydantic Schemas & DTOs
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel


# ── Role Definitions ──────────────────────────────────────────────────────────

class UserRole(str, Enum):
    FINANCE = "finance"
    MARKETING = "marketing"
    HR = "hr"
    ENGINEERING = "engineering"
    EXECUTIVE = "executive"
    EMPLOYEE = "employee"
    ROOT = "root"


ROLE_DISPLAY_NAMES = {
    UserRole.FINANCE: "Finance Team",
    UserRole.MARKETING: "Marketing Team",
    UserRole.HR: "HR Team",
    UserRole.ENGINEERING: "Engineering Department",
    UserRole.EXECUTIVE: "C-Level Executive",
    UserRole.EMPLOYEE: "Employee",
    UserRole.ROOT: "System Administrator",
}

ROLE_COLORS = {
    UserRole.FINANCE: "#22c55e",       # green
    UserRole.MARKETING: "#f97316",     # orange
    UserRole.HR: "#a855f7",            # purple
    UserRole.ENGINEERING: "#3b82f6",   # blue
    UserRole.EXECUTIVE: "#eab308",     # gold
    UserRole.EMPLOYEE: "#94a3b8",      # slate
    UserRole.ROOT: "#ef4444",          # red
}

ROLE_EMOJIS = {
    UserRole.FINANCE: "💰",
    UserRole.MARKETING: "📈",
    UserRole.HR: "👥",
    UserRole.ENGINEERING: "⚙️",
    UserRole.EXECUTIVE: "👑",
    UserRole.EMPLOYEE: "🏢",
    UserRole.ROOT: "🔑",
}


# ── Department Models ──────────────────────────────────────────────────────────

class DepartmentCreate(BaseModel):
    name: str
    description: str
    image: Optional[str] = "🏢"
    status: Optional[str] = "Active"
    id: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    status: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: str
    name: str
    description: str
    image: str
    status: str
    createdBy: str
    createdAt: str
    updatedAt: str
    user_count: int = 0


# ── User Administration Models ────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    full_name: str
    departmentId: Optional[str] = None


class UserUpdate(BaseModel):
    password: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    departmentId: Optional[str] = None


class UserAdminResponse(BaseModel):
    username: str
    role: str
    full_name: str
    is_active: bool
    departmentId: Optional[str] = None


# ── Auth Models ───────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    display_name: str
    username: str
    role_color: str
    role_emoji: str


class UserInfo(BaseModel):
    username: str
    role: str
    display_name: str
    role_color: str
    role_emoji: str


# ── Chat & RAG Models ─────────────────────────────────────────────────────────

class SourceDocument(BaseModel):
    source_file: str
    department: str
    content_preview: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceDocument]
    role: UserRole
    collections_searched: list[str]
    session_id: Optional[str] = None


class RenameSessionRequest(BaseModel):
    title: str


class HealthResponse(BaseModel):
    status: str
    version: str
    collections_loaded: list[str]

