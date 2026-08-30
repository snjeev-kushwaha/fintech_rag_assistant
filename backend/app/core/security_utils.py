"""
FinSolve Technologies — Security Utilities & Input Sanitization
Provides strict path traversal protection, filename sanitization,
extension whitelisting, and payload size verification.
"""

import os
import re
from pathlib import Path
from fastapi import HTTPException, status
from backend.app.core.config import DATA_DIR

ALLOWED_EXTENSIONS = {".txt", ".md", ".pdf", ".csv", ".json", ".docx", ".doc", ".xlsx"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 Megabytes
DEPT_ID_REGEX = re.compile(r"^[a-zA-Z0-9_-]{2,50}$")


def sanitize_filename(filename: str) -> str:
    """
    Sanitize and validate an uploaded filename against path traversal and forbidden characters.
    """
    if not filename or not isinstance(filename, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename provided.",
        )

    # Strip any directory path components
    clean_name = os.path.basename(filename).strip()

    # Disallow hidden files or dangerous extensions
    if clean_name.startswith("."):
        clean_name = clean_name.lstrip(".")

    # Remove dangerous characters, allow only alphanumeric, underscores, hyphens, and dots
    clean_name = re.sub(r"[^a-zA-Z0-9_.-]", "_", clean_name)

    # Disallow multiple consecutive dots (e.g. ../ or ..)
    clean_name = re.sub(r"\.{2,}", ".", clean_name)

    if not clean_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename contains no valid characters.",
        )

    # Validate allowed extension
    ext = Path(clean_name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' is not supported. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    return clean_name


def validate_department_id(dept_id: str) -> str:
    """
    Validate department ID to prevent path traversal or injection.
    """
    if not dept_id or not isinstance(dept_id, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid department ID provided.",
        )

    cleaned_id = dept_id.strip().lower()
    if not DEPT_ID_REGEX.match(cleaned_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department ID must be 2-50 alphanumeric characters (hyphens and underscores allowed).",
        )

    return cleaned_id


def safe_resolve_data_path(dept_id: str, filename: str | None = None) -> Path:
    """
    Resolve and verify that a target path resides strictly inside backend/data/.
    Raises HTTP 403 / 400 if path traversal is attempted.
    """
    clean_dept = validate_department_id(dept_id)
    base_dir = DATA_DIR.resolve()
    target_dir = (base_dir / clean_dept).resolve()

    # Ensure target_dir is inside base_dir
    try:
        target_dir.relative_to(base_dir)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Security violation: Invalid directory path.",
        )

    if not filename:
        return target_dir

    clean_file = sanitize_filename(filename)
    target_file = (target_dir / clean_file).resolve()

    # Ensure target_file is inside target_dir
    try:
        target_file.relative_to(target_dir)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Security violation: Path traversal detected.",
        )

    return target_file


def validate_file_size(content_bytes: bytes):
    """Verify file size does not exceed maximum allowable limit."""
    if len(content_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed upload size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
        )
