"""
FinSolve Technologies — Pytest Configuration & Fixtures
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure sys.path includes backend and project root
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
for p in [str(PROJECT_ROOT), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.main import app
from backend.app.core.security import create_access_token
from backend.app.models.schemas import UserRole


@pytest.fixture(scope="session")
def client():
    """Reusable FastAPI TestClient instance."""
    with TestClient(app) as test_client:
        yield test_client


def _make_auth_header(username: str, role: str, department_id: str | None = None) -> dict:
    """Helper to generate valid JWT Authorization headers."""
    token = create_access_token({
        "sub": username,
        "role": role,
        "departmentId": department_id or role,
        "full_name": f"Test {username.title()}",
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def root_headers():
    return _make_auth_header("root", UserRole.ROOT.value, "root")


@pytest.fixture
def finance_headers():
    return _make_auth_header("alice_finance", UserRole.FINANCE.value, "finance")


@pytest.fixture
def hr_headers():
    return _make_auth_header("carol_hr", UserRole.HR.value, "hr")


@pytest.fixture
def marketing_headers():
    return _make_auth_header("bob_marketing", UserRole.MARKETING.value, "marketing")


@pytest.fixture
def eng_headers():
    return _make_auth_header("dave_eng", UserRole.ENGINEERING.value, "engineering")


@pytest.fixture
def employee_headers():
    return _make_auth_header("employee1", UserRole.EMPLOYEE.value, "employee")
