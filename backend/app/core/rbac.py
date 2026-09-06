"""
FinSolve Technologies — RAG RBAC Chatbot
Role-Based Access Control — Permissions & Rules
"""

from typing import Callable
from fastapi import HTTPException, status

from backend.app.db.roles_store import get_role_by_id


def get_collection_label(collection_name: str) -> str:
    """
    Dynamically retrieve human-readable display label for a collection/department from MongoDB.
    Queries the database collections and roles dynamically without any hardcoded dictionary.
    """
    if not collection_name:
        return ""

    clean = str(collection_name).strip().lower()

    # 1. Query MongoDB departments repository
    try:
        from backend.app.db.departments_store import get_department_by_id
        dept_key = clean.replace("_data", "")
        dept = get_department_by_id(clean) or get_department_by_id(dept_key)
        if dept and dept.name:
            return dept.name
    except Exception:
        pass

    # 2. Query MongoDB roles repository
    try:
        role_key = clean.replace("_data", "")
        role_rec = get_role_by_id(clean) or get_role_by_id(role_key)
        if role_rec and role_rec.name:
            return role_rec.name
    except Exception:
        pass

    # 3. Dynamic formatting fallback
    return clean.replace("_", " ").title()


class DynamicCollectionLabels(dict):
    """
    Dynamic dictionary proxy that retrieves collection display labels directly
    from MongoDB on demand, replacing static hardcoded role dictionaries.
    """
    def get(self, key, default=None):
        if not key:
            return default if default is not None else ""
        label = get_collection_label(str(key))
        if label:
            return label
        return default if default is not None else str(key)

    def __getitem__(self, key):
        label = get_collection_label(str(key))
        if label:
            return label
        raise KeyError(key)

    def __contains__(self, key):
        return True


# Dynamic database-backed collection label resolver
COLLECTION_LABELS = DynamicCollectionLabels()


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
