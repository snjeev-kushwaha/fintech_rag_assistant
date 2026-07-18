"""
FinSolve Technologies — RAG RBAC Chatbot
Role-Based Access Control — Collection Permission Mapping
"""

from functools import wraps
from typing import Callable
# pyrefly: ignore [missing-import]
from fastapi import HTTPException, status

from backend.models import UserRole


# ── RBAC Collection Mapping ───────────────────────────────────────────────────
# Maps each role to the list of ChromaDB collections they can query.
# Collections correspond to department data folders.

ROLE_COLLECTIONS: dict[UserRole, list[str]] = {
    UserRole.FINANCE: [
        "finance",
        "general",
    ],
    UserRole.MARKETING: [
        "marketing",
        "general",
    ],
    UserRole.HR: [
        "hr_data",
        "general",
    ],
    UserRole.ENGINEERING: [
        "engineering",
        "general",
    ],
    UserRole.EXECUTIVE: [
        # C-Level has full access to ALL collections
        "finance",
        "marketing",
        "hr_data",
        "engineering",
        "general",
    ],
    UserRole.EMPLOYEE: [
        # Basic employees can only access general company information
        "general",
    ],
}

# Human-readable labels for each collection
COLLECTION_LABELS: dict[str, str] = {
    "finance": "Finance Department",
    "marketing": "Marketing Department",
    "hr_data": "Human Resources",
    "engineering": "Engineering Department",
    "general": "General Company Information",
}


def get_allowed_collections(role: UserRole) -> list[str]:
    """Return the list of ChromaDB collection names accessible to a given role."""
    return ROLE_COLLECTIONS.get(role, ["general"])


def check_collection_access(role: UserRole, collection: str) -> bool:
    """Return True if the role has access to the given collection."""
    return collection in get_allowed_collections(role)


def require_role(*allowed_roles: UserRole) -> Callable:
    """
    FastAPI dependency factory: raises 403 if the current user's role
    is not in allowed_roles.

    Usage:
        @router.get("/finance-only")
        async def endpoint(user=Depends(require_role(UserRole.FINANCE, UserRole.EXECUTIVE))):
            ...
    """
    def dependency(current_user=None):
        if current_user and current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}. "
                       f"Your role: {current_user.role.value}",
            )
        return current_user
    return dependency
