"""
FinSolve Technologies — RAG RBAC Chatbot
Role-Based Access Control — Permissions & Rules
"""

from typing import Callable
from fastapi import HTTPException, status

from backend.app.db.roles_store import get_role_by_id


# ── RBAC Dynamic Collection Mapping ───────────────────────────────────────────
# Human-readable labels for standard department collections
COLLECTION_LABELS: dict[str, str] = {
    "finance": "Finance Department",
    "marketing": "Marketing Department",
    "hr_data": "Human Resources",
    "engineering": "Engineering Department",
    "general": "General Company Information",
}


def get_allowed_collections(role: str) -> list[str]:
    """
    Return the list of ChromaDB collection names accessible to a given role.
    Dynamically resolved from the database 'roles' table.
    """
    if not role:
        return ["general"]

    role_str = role.value if hasattr(role, "value") else str(role).strip().lower()

    try:
        role_rec = get_role_by_id(role_str)
        if role_rec and role_rec.allowed_collections:
            return list(role_rec.allowed_collections)
    except Exception:
        pass

    # Dynamic fallback: ensures at least the role's own department & general are accessible
    return [role_str, "general"]


def check_collection_access(role: str, collection: str) -> bool:
    """Return True if the role has access to the given collection."""
    allowed = get_allowed_collections(role)
    return collection in allowed or "*" in allowed


def require_role(*allowed_roles: str) -> Callable:
    """
    FastAPI dependency factory: raises 403 if the current user's role
    is not in allowed_roles.
    """
    allowed_values = [
        r.value if hasattr(r, "value") else str(r).strip().lower()
        for r in allowed_roles
    ]

    def dependency(current_user=None):
        if current_user:
            user_role_str = (
                current_user.role.value
                if hasattr(current_user.role, "value")
                else str(current_user.role).strip().lower()
            )
            if user_role_str not in allowed_values:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required roles: {allowed_values}. Your role: {user_role_str}",
                )
        return current_user
    return dependency
