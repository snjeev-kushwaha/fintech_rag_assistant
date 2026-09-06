"""
FinSolve Technologies — Unit Tests for Security, Input Sanitization & RBAC
"""

import pytest
from fastapi import HTTPException

from backend.app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)
from backend.app.core.security_utils import (
    sanitize_filename,
    validate_department_id,
    safe_resolve_data_path,
    validate_file_size,
    MAX_FILE_SIZE_BYTES,
)
from backend.app.core.rbac import (
    get_allowed_collections,
    check_collection_access,
    require_role,
)
from backend.app.models.schemas import UserRole, UserInfo


# ── Password Hashing & Verification ──────────────────────────────────────────

class TestPasswordHashing:
    def test_hash_and_verify_success(self):
        plain = "SuperSecretPassword123!"
        hashed = hash_password(plain)
        assert hashed != plain
        assert verify_password(plain, hashed) is True

    def test_verify_wrong_password(self):
        plain = "CorrectPassword"
        hashed = hash_password(plain)
        assert verify_password("WrongPassword", hashed) is False

    def test_verify_empty_or_tampered_password(self):
        hashed = hash_password("ValidPassword")
        assert verify_password("", hashed) is False


# ── JWT Token Lifecycle ───────────────────────────────────────────────────────

class TestJWTTokens:
    def test_create_and_decode_token(self):
        payload = {"sub": "alice_finance", "role": "finance", "departmentId": "finance"}
        token = create_access_token(payload)
        assert isinstance(token, str)
        assert len(token) > 20

        decoded = decode_token(token)
        assert decoded is not None
        assert decoded.get("sub") == "alice_finance"
        assert decoded.get("role") == "finance"

    def test_decode_invalid_token(self):
        with pytest.raises(HTTPException) as exc:
            decode_token("this-is-not-a-valid-token")
        assert exc.value.status_code == 401

        with pytest.raises(HTTPException) as exc:
            decode_token("")
        assert exc.value.status_code == 401


# ── Path Traversal Armor & Sanitization ────────────────────────────────────────

class TestSecurityUtils:
    def test_sanitize_filename_valid(self):
        assert sanitize_filename("q1_report.pdf") == "q1_report.pdf"
        assert sanitize_filename("notes.txt") == "notes.txt"
        assert sanitize_filename("dataset.csv") == "dataset.csv"
        assert sanitize_filename("guide.md") == "guide.md"

    def test_sanitize_filename_path_traversal(self):
        # Path components should be stripped
        result = sanitize_filename("../../etc/passwd.txt")
        assert ".." not in result
        assert "/" not in result
        assert "\\" not in result

    def test_sanitize_filename_disallowed_extension(self):
        with pytest.raises(HTTPException) as exc:
            sanitize_filename("script.py")
        assert exc.value.status_code == 400

        with pytest.raises(HTTPException) as exc:
            sanitize_filename("malware.exe")
        assert exc.value.status_code == 400

        with pytest.raises(HTTPException) as exc:
            sanitize_filename("exploit.sh")
        assert exc.value.status_code == 400

    def test_validate_department_id_valid(self):
        assert validate_department_id("finance") == "finance"
        assert validate_department_id("hr-team") == "hr-team"
        assert validate_department_id("eng_dev") == "eng_dev"

    def test_validate_department_id_invalid(self):
        with pytest.raises(HTTPException):
            validate_department_id("../etc")
        with pytest.raises(HTTPException):
            validate_department_id("a")  # Too short (< 2)
        with pytest.raises(HTTPException):
            validate_department_id("dept; DROP TABLE users;")

    def test_safe_resolve_data_path_normal(self):
        path = safe_resolve_data_path("finance", "report.pdf")
        assert path.name == "report.pdf"
        assert "finance" in str(path)

    def test_validate_file_size(self):
        # Within limit
        validate_file_size(b"hello world")

        # Exceeds limit
        huge_bytes = b"0" * (MAX_FILE_SIZE_BYTES + 1024)
        with pytest.raises(HTTPException) as exc:
            validate_file_size(huge_bytes)
        assert exc.value.status_code == 413


# ── RBAC Authorization & Scoping ──────────────────────────────────────────────

class TestRBAC:
    def test_finance_allowed_collections(self):
        cols = get_allowed_collections(UserRole.FINANCE)
        assert "finance" in cols
        assert "general" in cols
        assert "hr_data" not in cols
        assert "engineering" not in cols

    def test_hr_allowed_collections(self):
        cols = get_allowed_collections(UserRole.HR)
        assert "hr_data" in cols
        assert "general" in cols
        assert "finance" not in cols

    def test_engineering_allowed_collections(self):
        cols = get_allowed_collections(UserRole.ENGINEERING)
        assert "engineering" in cols
        assert "general" in cols
        assert "finance" not in cols

    def test_marketing_allowed_collections(self):
        cols = get_allowed_collections(UserRole.MARKETING)
        assert "marketing" in cols
        assert "general" in cols
        assert "engineering" not in cols

    def test_executive_and_root_full_access(self):
        for role in [UserRole.EXECUTIVE, UserRole.ROOT]:
            cols = get_allowed_collections(role)
            for expected in ["finance", "marketing", "hr_data", "engineering", "general"]:
                assert expected in cols

    def test_employee_general_only(self):
        cols = get_allowed_collections(UserRole.EMPLOYEE)
        assert cols == ["general"]

    def test_check_collection_access(self):
        assert check_collection_access(UserRole.FINANCE, "finance") is True
        assert check_collection_access(UserRole.FINANCE, "hr_data") is False
        assert check_collection_access(UserRole.EMPLOYEE, "general") is True
        assert check_collection_access(UserRole.EMPLOYEE, "finance") is False
        assert check_collection_access(UserRole.EXECUTIVE, "hr_data") is True

    def test_require_role_authorized(self):
        guard = require_role(UserRole.ROOT, UserRole.EXECUTIVE)
        user = UserInfo(
            username="root",
            role=UserRole.ROOT.value,
            display_name="System Administrator",
            role_color="#ef4444",
            role_emoji="🔑",
        )
        res = guard(current_user=user)
        assert res.username == "root"

    def test_require_role_unauthorized(self):
        guard = require_role(UserRole.ROOT)
        user = UserInfo(
            username="alice",
            role=UserRole.FINANCE.value,
            display_name="Finance Team Member",
            role_color="#22c55e",
            role_emoji="💰",
        )
        with pytest.raises(HTTPException) as exc:
            guard(current_user=user)
        assert exc.value.status_code == 403
