"""
Administration endpoints for department management.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.core.security import get_current_user, require_root
from backend.app.models.schemas import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    UserInfo,
)
from backend.app.db.departments_store import (
    load_all_departments,
    create_department_record,
    update_department_record,
    delete_department_record,
    get_department_user_count,
)

router = APIRouter(prefix="/admin/departments", tags=["Administration"])


@router.get("", response_model=list[DepartmentResponse])
async def get_departments(user: UserInfo = Depends(get_current_user)):
    """List all corporate departments with dynamic user counts."""
    depts = load_all_departments()
    return [
        DepartmentResponse(
            id=d.id,
            name=d.name,
            description=d.description,
            image=d.image,
            status=d.status,
            createdBy=d.createdBy,
            createdAt=d.createdAt,
            updatedAt=d.updatedAt,
            user_count=get_department_user_count(d.id),
        )
        for d in depts
    ]


@router.post("", response_model=DepartmentResponse)
async def create_department(request: DepartmentCreate, admin: UserInfo = Depends(require_root)):
    """Create a new corporate department in MongoDB."""
    try:
        new_dept = create_department_record(
            name=request.name,
            description=request.description,
            image=request.image,
            status=request.status or "Active",
            created_by=admin.username,
            custom_id=request.id,
        )
        return DepartmentResponse(
            id=new_dept.id,
            name=new_dept.name,
            description=new_dept.description,
            image=new_dept.image,
            status=new_dept.status,
            createdBy=new_dept.createdBy,
            createdAt=new_dept.createdAt,
            updatedAt=new_dept.updatedAt,
            user_count=0,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{dept_id}", response_model=DepartmentResponse)
async def update_department(dept_id: str, request: DepartmentUpdate, admin: UserInfo = Depends(require_root)):
    """Update department details in MongoDB."""
    try:
        updated = update_department_record(
            dept_id=dept_id,
            name=request.name,
            description=request.description,
            image=request.image,
            status=request.status,
        )
        return DepartmentResponse(
            id=updated.id,
            name=updated.name,
            description=updated.description,
            image=updated.image,
            status=updated.status,
            createdBy=updated.createdBy,
            createdAt=updated.createdAt,
            updatedAt=updated.updatedAt,
            user_count=get_department_user_count(updated.id),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(dept_id: str, admin: UserInfo = Depends(require_root)):
    """Delete a department (fails if users are currently assigned)."""
    try:
        delete_department_record(dept_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
