"""
Administration endpoints for dynamic Role management with RBAC enforcement.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.core.security import get_current_user, require_root
from backend.app.models.schemas import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    UserInfo,
)
from backend.app.db.roles_store import (
    load_all_roles,
    get_role_by_id,
    get_role_user_count,
    create_role_record,
    update_role_record,
    delete_role_record,
)

router = APIRouter(prefix="/admin/roles", tags=["Administration"])


@router.get("", response_model=list[RoleResponse])
async def get_roles(current_user: UserInfo = Depends(get_current_user)):
    """List all enterprise roles configured in MongoDB with real-time user counts."""
    roles = load_all_roles()
    return [
        RoleResponse(
            id=r.id,
            name=r.name,
            description=r.description,
            allowed_collections=r.allowed_collections,
            color=r.color,
            is_system=r.is_system,
            createdBy=r.createdBy,
            createdAt=r.createdAt,
            updatedAt=r.updatedAt,
            user_count=get_role_user_count(r.id),
        )
        for r in roles
    ]


@router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(request: RoleCreate, admin: UserInfo = Depends(require_root)):
    """Create a new role dynamically in the database (Restricted to Root Administrator)."""
    if not request.name or not request.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name cannot be empty.",
        )

    try:
        new_role = create_role_record(
            name=request.name.strip(),
            description=request.description or "",
            allowed_collections=request.allowed_collections,
            color=request.color or "#3b82f6",
            custom_id=request.id,
            created_by=admin.username,
        )
        return RoleResponse(
            id=new_role.id,
            name=new_role.name,
            description=new_role.description,
            allowed_collections=new_role.allowed_collections,
            color=new_role.color,
            is_system=new_role.is_system,
            createdBy=new_role.createdBy,
            createdAt=new_role.createdAt,
            updatedAt=new_role.updatedAt,
            user_count=0,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(role_id: str, current_user: UserInfo = Depends(get_current_user)):
    """Retrieve details of a specific role."""
    role = get_role_by_id(role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{role_id}' not found.",
        )
    return RoleResponse(
        id=role.id,
        name=role.name,
        description=role.description,
        allowed_collections=role.allowed_collections,
        color=role.color,
        is_system=role.is_system,
        createdBy=role.createdBy,
        createdAt=role.createdAt,
        updatedAt=role.updatedAt,
        user_count=get_role_user_count(role.id),
    )


@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: str,
    request: RoleUpdate,
    admin: UserInfo = Depends(require_root),
):
    """Update role metadata, permissions, or colors (Restricted to Root Administrator)."""
    clean_id = role_id.strip().lower()
    try:
        updated = update_role_record(
            role_id=clean_id,
            name=request.name,
            description=request.description,
            allowed_collections=request.allowed_collections,
            color=request.color,
        )
        return RoleResponse(
            id=updated.id,
            name=updated.name,
            description=updated.description,
            allowed_collections=updated.allowed_collections,
            color=updated.color,
            is_system=updated.is_system,
            createdBy=updated.createdBy,
            createdAt=updated.createdAt,
            updatedAt=updated.updatedAt,
            user_count=get_role_user_count(updated.id),
        )
    except ValueError as e:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if "not found" in str(e).lower()
            else status.HTTP_400_BAD_REQUEST
        )
        raise HTTPException(status_code=status_code, detail=str(e))


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(role_id: str, admin: UserInfo = Depends(require_root)):
    """Delete a dynamic role from the database (Restricted to Root Administrator)."""
    clean_id = role_id.strip().lower()
    try:
        delete_role_record(clean_id)
    except ValueError as e:
        err_msg = str(e).lower()
        if "not found" in err_msg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
