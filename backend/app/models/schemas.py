"""
FinSolve Technologies — RAG RBAC Chatbot
Pydantic Schemas & DTOs
"""

from typing import Optional
from pydantic import BaseModel


# ── Role Administration Models ────────────────────────────────────────────────

class RoleCreate(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    allowed_collections: Optional[list[str]] = None
    color: Optional[str] = "#3b82f6"


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    allowed_collections: Optional[list[str]] = None
    color: Optional[str] = None


class RoleResponse(BaseModel):
    id: str
    name: str
    description: str
    allowed_collections: list[str]
    color: str
    is_system: bool = False
    createdBy: str
    createdAt: str
    updatedAt: str
    user_count: int = 0


# ── Department Models ──────────────────────────────────────────────────────────

class DepartmentCreate(BaseModel):
    name: str
    description: str
    image: Optional[str] = ""
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


class UserInfo(BaseModel):
    username: str
    role: str
    display_name: str
    role_color: str


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
    role: str
    collections_searched: list[str]
    session_id: Optional[str] = None


class RenameSessionRequest(BaseModel):
    title: str


class HealthResponse(BaseModel):
    status: str
    version: str
    collections_loaded: list[str]

