"""
Administration endpoints for department management and knowledge file synchronization.
Ensures 100% consistency across MongoDB, physical data folder, and ChromaDB vector store.
"""

import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from backend.app.core.config import DATA_DIR
from backend.app.core.security import get_current_user, require_root
from backend.app.core.security_utils import (
    sanitize_filename,
    validate_department_id,
    safe_resolve_data_path,
    validate_file_size,
)
from backend.app.models.schemas import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    UserInfo,
)
from backend.app.db.departments_store import (
    load_all_departments,
    get_department_by_id,
    create_department_record,
    update_department_record,
    delete_department_record,
    get_department_user_count,
)
from backend.app.db.vector_store import (
    ingest_single_file,
    delete_collection_for_department,
    reingest_department_directory,
)

router = APIRouter(prefix="/admin/departments", tags=["Administration"])


def _format_file_size(size_bytes: int) -> str:
    """Format byte count into human readable string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


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
    """
    Create a new corporate department in MongoDB and automatically provision
    its physical folder inside backend/data/<dept_id>/ with initial overview text.
    """
    try:
        new_dept = create_department_record(
            name=request.name.strip(),
            description=request.description.strip(),
            image=request.image,
            status=request.status or "Active",
            created_by=admin.username,
            custom_id=request.id.strip() if request.id else None,
        )

        # Automatically provision physical department data directory safely
        dept_dir = safe_resolve_data_path(new_dept.id)
        dept_dir.mkdir(parents=True, exist_ok=True)

        # Create starter overview.txt if folder is currently empty
        overview_file = dept_dir / "overview.txt"
        if not overview_file.exists():
            overview_text = (
                f"DEPARTMENT KNOWLEDGE BASE: {new_dept.name.upper()}\n"
                f"{'=' * 50}\n\n"
                f"Department ID: {new_dept.id}\n"
                f"Department Name: {new_dept.name}\n"
                f"Operational Status: {new_dept.status}\n"
                f"Created By: {new_dept.createdBy}\n\n"
                f"Department Overview & Scope:\n"
                f"{new_dept.description}\n\n"
                f"Knowledge Repository:\n"
                f"This directory houses official domain documents, policies, operational metrics, "
                f"and guidelines for the {new_dept.name} team at FinSolve Technologies.\n"
            )
            overview_file.write_text(overview_text, encoding="utf-8")
            try:
                ingest_single_file(overview_file, new_dept.id)
            except Exception as e:
                print(f"[Departments] Initial overview vector ingestion notice: {e}")

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
async def update_department(
    dept_id: str,
    request: DepartmentUpdate,
    admin: UserInfo = Depends(require_root),
):
    """Update department name, description, icon image, or status."""
    try:
        clean_dept_id = validate_department_id(dept_id)
        updated_dept = update_department_record(
            dept_id=clean_dept_id,
            name=request.name.strip() if request.name else None,
            description=request.description.strip() if request.description else None,
            image=request.image,
            status=request.status,
        )
        return DepartmentResponse(
            id=updated_dept.id,
            name=updated_dept.name,
            description=updated_dept.description,
            image=updated_dept.image,
            status=updated_dept.status,
            createdBy=updated_dept.createdBy,
            createdAt=updated_dept.createdAt,
            updatedAt=updated_dept.updatedAt,
            user_count=get_department_user_count(clean_dept_id),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(dept_id: str, admin: UserInfo = Depends(require_root)):
    """
    Delete a department from MongoDB, physically erase its data directory (backend/data/<dept_id>/),
    and drop its corresponding vector collection from ChromaDB.
    """
    clean_dept_id = validate_department_id(dept_id)
    try:
        delete_department_record(clean_dept_id)

        # Physically erase data folder from disk safely
        dept_dir = safe_resolve_data_path(clean_dept_id)
        if dept_dir.exists() and dept_dir.is_dir():
            shutil.rmtree(dept_dir)
            print(f"[Departments] Erased department directory: {dept_dir}")

        # Drop department collection from ChromaDB
        delete_collection_for_department(clean_dept_id)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# ══════════════════════════════════════════════════════════════════════════════
# DEPARTMENT KNOWLEDGE DOCUMENTS & FILE SYNCHRONIZATION ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/{dept_id}/files")
async def get_department_files(dept_id: str, user: UserInfo = Depends(get_current_user)):
    """
    List all knowledge documents currently stored in backend/data/<dept_id>/.
    """
    clean_dept_id = validate_department_id(dept_id)
    dept = get_department_by_id(clean_dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail=f"Department '{dept_id}' not found.")

    dept_dir = safe_resolve_data_path(clean_dept_id)
    if not dept_dir.exists() or not dept_dir.is_dir():
        return []

    files_list = []
    for item in sorted(dept_dir.iterdir()):
        if item.is_file() and not item.name.startswith("."):
            stat = item.stat()
            mod_time = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()
            files_list.append({
                "filename": item.name,
                "size_bytes": stat.st_size,
                "size_formatted": _format_file_size(stat.st_size),
                "modified_at": mod_time,
                "extension": item.suffix.lower().lstrip("."),
            })

    return files_list


@router.post("/{dept_id}/upload")
async def upload_department_file(
    dept_id: str,
    file: UploadFile = File(...),
    admin: UserInfo = Depends(require_root),
):
    """
    Upload a new knowledge document into backend/data/<dept_id>/
    and automatically index its chunks into ChromaDB vector store.
    """
    clean_dept_id = validate_department_id(dept_id)
    dept = get_department_by_id(clean_dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail=f"Department '{dept_id}' not found.")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected for upload.")

    safe_filename = sanitize_filename(file.filename)
    file_path = safe_resolve_data_path(clean_dept_id, safe_filename)
    file_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        content_bytes = await file.read()
        validate_file_size(content_bytes)
        file_path.write_bytes(content_bytes)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write file to disk: {str(e)}")

    # Ingest file into ChromaDB vector store
    chunks_ingested = ingest_single_file(file_path, clean_dept_id)

    stat = file_path.stat()
    return {
        "filename": safe_filename,
        "department": clean_dept_id,
        "size_bytes": stat.st_size,
        "size_formatted": _format_file_size(stat.st_size),
        "chunks_ingested": chunks_ingested,
        "message": f"Successfully saved '{safe_filename}' to {dept.name} knowledge folder and indexed {chunks_ingested} text chunks.",
    }


@router.delete("/{dept_id}/files/{filename}")
async def delete_department_file(
    dept_id: str,
    filename: str,
    admin: UserInfo = Depends(require_root),
):
    """
    Delete a specific document from backend/data/<dept_id>/
    and re-sync the ChromaDB vector collection to keep data folder consistent.
    """
    clean_dept_id = validate_department_id(dept_id)
    dept = get_department_by_id(clean_dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail=f"Department '{dept_id}' not found.")

    safe_filename = sanitize_filename(filename)
    file_path = safe_resolve_data_path(clean_dept_id, safe_filename)
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail=f"File '{safe_filename}' not found in department '{dept_id}'.")

    try:
        file_path.unlink()
        print(f"[Departments] Deleted document: {file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file from disk: {str(e)}")

    # Re-sync ChromaDB vector store for this department
    remaining_chunks = reingest_department_directory(clean_dept_id)

    return {
        "filename": safe_filename,
        "department": clean_dept_id,
        "remaining_chunks": remaining_chunks,
        "message": f"File '{safe_filename}' removed and knowledge vector store re-indexed.",
    }
