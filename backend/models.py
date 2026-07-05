"""
FinSolve Technologies — RAG RBAC Chatbot
Pydantic Models
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


ROLE_DISPLAY_NAMES = {
    UserRole.FINANCE: "Finance Team",
    UserRole.MARKETING: "Marketing Team",
    UserRole.HR: "HR Team",
    UserRole.ENGINEERING: "Engineering Department",
    UserRole.EXECUTIVE: "C-Level Executive",
    UserRole.EMPLOYEE: "Employee",
}

ROLE_COLORS = {
    UserRole.FINANCE: "#22c55e",       # green
    UserRole.MARKETING: "#f97316",     # orange
    UserRole.HR: "#a855f7",            # purple
    UserRole.ENGINEERING: "#3b82f6",   # blue
    UserRole.EXECUTIVE: "#eab308",     # gold
    UserRole.EMPLOYEE: "#94a3b8",      # slate
}

ROLE_EMOJIS = {
    UserRole.FINANCE: "💰",
    UserRole.MARKETING: "📈",
    UserRole.HR: "👥",
    UserRole.ENGINEERING: "⚙️",
    UserRole.EXECUTIVE: "👑",
    UserRole.EMPLOYEE: "🏢",
}


# ── Request / Response Models ─────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    display_name: str
    username: str
    role_color: str
    role_emoji: str


class UserInfo(BaseModel):
    username: str
    role: UserRole
    display_name: str
    role_color: str
    role_emoji: str


class SourceDocument(BaseModel):
    source_file: str
    department: str
    content_preview: str


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceDocument]
    role: UserRole
    collections_searched: list[str]


class HealthResponse(BaseModel):
    status: str
    version: str
    collections_loaded: list[str]
