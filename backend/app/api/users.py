"""
Administration endpoints for user account management.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.core.security import get_current_user, require_root
from backend.app.models.schemas import (
    UserCreate,
    UserUpdate,
    UserAdminResponse,
    UserInfo,
)
from backend.app.db.users_store import (
    load_all_users,
    create_user_record,
    update_user_record,
    delete_user_record,
)

router = APIRouter(prefix="/admin/users", tags=["Administration"])


@router.get("", response_model=list[UserAdminResponse])
async def get_users(user: UserInfo = Depends(get_current_user)):
    """List all registered users in the persistent database."""
    users = load_all_users()
    return [
        UserAdminResponse(
            username=u.username,
            role=u.role,
            full_name=u.full_name,
            is_active=u.is_active,
            departmentId=getattr(u, "departmentId", u.role),
        )
        for u in users.values()
    ]


@router.post("", response_model=UserAdminResponse)
async def create_user(request: UserCreate, admin: UserInfo = Depends(require_root)):
    """Register a new user inside the persistent database."""
    try:
        new_rec = create_user_record(
            username=request.username.strip(),
            password_raw=request.password,
            role=request.role.value if hasattr(request.role, "value") else str(request.role),
            full_name=request.full_name.strip(),
            department_id=request.departmentId,
        )
        return UserAdminResponse(
            username=new_rec.username,
            role=new_rec.role,
            full_name=new_rec.full_name,
            is_active=new_rec.is_active,
            departmentId=new_rec.departmentId,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{username}", response_model=UserAdminResponse)
async def update_user(
    username: str,
    request: UserUpdate,
    admin: UserInfo = Depends(require_root),
):
    """Update a user's role, name, status, or password in the database."""
    try:
        updated_rec = update_user_record(
            username=username,
            password_raw=request.password,
            role=request.role.value if hasattr(request.role, "value") and request.role else (str(request.role) if request.role else None),
            full_name=request.full_name.strip() if request.full_name else None,
            is_active=request.is_active,
            department_id=request.departmentId,
        )
        return UserAdminResponse(
            username=updated_rec.username,
            role=updated_rec.role,
            full_name=updated_rec.full_name,
            is_active=updated_rec.is_active,
            departmentId=updated_rec.departmentId,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{username}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(username: str, admin: UserInfo = Depends(require_root)):
    """Delete a user account (system administrator account cannot be deleted)."""
    try:
        delete_user_record(username)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
