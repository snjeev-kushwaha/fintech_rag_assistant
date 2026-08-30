"""
FinSolve Technologies — RAG RBAC Chatbot
Role-Based Access Control — Permissions & Rules
"""

from typing import Callable
from fastapi import HTTPException, status

from backend.app.models.schemas import UserRole


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


def get_allowed_collections(role: UserRole | str) -> list[str]:
    """Return the list of ChromaDB collection names accessible to a given role."""
    role_str = role.value if isinstance(role, UserRole) else str(role).lower()

    # Try matching UserRole enum
    try:
        enum_role = UserRole(role_str)
        if enum_role in ROLE_COLLECTIONS:
            return ROLE_COLLECTIONS[enum_role]
    except ValueError:
        pass

    # Map standard string keys
    if role_str in ["finance", "finance_team", "fin"]:
        return ["finance", "general"]
    if role_str in ["marketing", "marketing_sales"]:
        return ["marketing", "general"]
    if role_str in ["hr", "human_resources", "hr_data"]:
        return ["hr_data", "general"]
    if role_str in ["engineering", "eng"]:
        return ["engineering", "general"]
    if role_str in ["executive", "root", "c_level"]:
        return ["finance", "marketing", "hr_data", "engineering", "general"]

    return [role_str, "general"]


def check_collection_access(role: UserRole | str, collection: str) -> bool:
    """Return True if the role has access to the given collection."""
    return collection in get_allowed_collections(role)


def require_role(*allowed_roles: UserRole) -> Callable:
    """
    FastAPI dependency factory: raises 403 if the current user's role
    is not in allowed_roles.
    """
    def dependency(current_user=None):
        if current_user:
            user_role_str = (
                current_user.role.value
                if hasattr(current_user.role, "value")
                else str(current_user.role)
            )
            allowed_values = [r.value for r in allowed_roles]
            if user_role_str not in allowed_values:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required roles: {allowed_values}. Your role: {user_role_str}",
                )
        return current_user
    return dependency
