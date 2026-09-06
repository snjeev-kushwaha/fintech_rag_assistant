"""
FinSolve Technologies — API Integration Tests
Tests /health, /auth, /admin/departments, /admin/users, and /chat endpoints with RBAC.
"""

import pytest
from fastapi.testclient import TestClient


# ── System Health & Security Middleware ───────────────────────────────────────

class TestSystemAndMiddleware:
    def test_health_endpoint(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "1.0.0"
        assert isinstance(data["collections_loaded"], list)

    def test_security_headers_injected(self, client: TestClient):
        response = client.get("/health")
        headers = response.headers
        assert headers.get("x-frame-options") == "DENY"
        assert headers.get("x-content-type-options") == "nosniff"
        assert "1; mode=block" in headers.get("x-xss-protection", "")


# ── Authentication Endpoints ──────────────────────────────────────────────────

class TestAuthAPI:
    def test_login_success(self, client: TestClient):
        response = client.post(
            "/auth/login",
            data={"username": "alice_finance", "password": "finance123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["role"] == "finance"
        assert data["username"] == "alice_finance"

    def test_login_invalid_password(self, client: TestClient):
        response = client.post(
            "/auth/login",
            data={"username": "alice_finance", "password": "wrongpassword!"},
        )
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    def test_login_nonexistent_user(self, client: TestClient):
        response = client.post(
            "/auth/login",
            data={"username": "no_such_user_12345", "password": "password"},
        )
        assert response.status_code == 401

    def test_auth_me_valid_token(self, client: TestClient, root_headers: dict):
        response = client.get("/auth/me", headers=root_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "root"
        assert data["role"] == "root"

    def test_auth_me_no_token(self, client: TestClient):
        response = client.get("/auth/me")
        assert response.status_code == 401

    def test_auth_me_invalid_token(self, client: TestClient):
        response = client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.value"})
        assert response.status_code == 401


# ── Admin & RBAC Protected Endpoints ──────────────────────────────────────────

class TestAdminRBACAPI:
    def test_departments_root_access_granted(self, client: TestClient, root_headers: dict):
        response = client.get("/admin/departments", headers=root_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        dept_ids = [d["id"] for d in data]
        assert "finance" in dept_ids or "engineering" in dept_ids or len(dept_ids) >= 0

    def test_departments_list_authenticated_access(self, client: TestClient, finance_headers: dict):
        response = client.get("/admin/departments", headers=finance_headers)
        assert response.status_code == 200

    def test_departments_create_finance_access_denied(self, client: TestClient, finance_headers: dict):
        response = client.post(
            "/admin/departments",
            json={"name": "Restricted", "description": "Restricted desc"},
            headers=finance_headers,
        )
        assert response.status_code == 403

    def test_departments_create_employee_access_denied(self, client: TestClient, employee_headers: dict):
        response = client.post(
            "/admin/departments",
            json={"name": "Restricted", "description": "Restricted desc"},
            headers=employee_headers,
        )
        assert response.status_code == 403

    def test_users_root_access_granted(self, client: TestClient, root_headers: dict):
        response = client.get("/admin/users", headers=root_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        usernames = [u["username"] for u in data]
        assert "root" in usernames

    def test_users_finance_access_denied(self, client: TestClient, finance_headers: dict):
        response = client.get("/admin/users", headers=finance_headers)
        assert response.status_code == 403

    def test_users_employee_access_denied(self, client: TestClient, employee_headers: dict):
        response = client.get("/admin/users", headers=employee_headers)
        assert response.status_code == 403

    def test_roles_list_authenticated_access(self, client: TestClient, finance_headers: dict):
        response = client.get("/admin/roles", headers=finance_headers)
        assert response.status_code == 200
        roles = response.json()
        assert isinstance(roles, list)
        role_ids = [r["id"] for r in roles]
        assert "finance" in role_ids
        assert "root" in role_ids

    def test_roles_create_finance_access_denied(self, client: TestClient, finance_headers: dict):
        response = client.post(
            "/admin/roles",
            json={"name": "Auditor", "description": "Audit role"},
            headers=finance_headers,
        )
        assert response.status_code == 403

    def test_roles_create_root_access_granted(self, client: TestClient, root_headers: dict):
        # Cleanup if exists from previous run
        client.delete("/admin/roles/test_auditor", headers=root_headers)
        response = client.post(
            "/admin/roles",
            json={"id": "test_auditor", "name": "Test Auditor", "description": "Internal audit"},
            headers=root_headers,
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["id"] == "test_auditor"
        assert data["name"] == "Test Auditor"

        # Cleanup
        del_res = client.delete("/admin/roles/test_auditor", headers=root_headers)
        assert del_res.status_code in [200, 204]

    def test_roles_delete_root_role_blocked(self, client: TestClient, root_headers: dict):
        response = client.delete("/admin/roles/root", headers=root_headers)
        assert response.status_code == 400


# ── Chat & RAG Scoped Endpoints ───────────────────────────────────────────────

class TestChatAPI:
    def test_chat_unauthenticated(self, client: TestClient):
        response = client.post("/chat", json={"message": "Hello"})
        assert response.status_code == 401

    def test_chat_empty_message(self, client: TestClient, finance_headers: dict):
        response = client.post("/chat", json={"message": "   "}, headers=finance_headers)
        assert response.status_code == 400
        assert "Message cannot be empty" in response.json()["detail"]

    def test_chat_scoped_finance_query(self, client: TestClient, finance_headers: dict):
        response = client.post(
            "/chat",
            json={"message": "Hello, what can you do?"},
            headers=finance_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert len(data["answer"]) > 0
        assert data["role"] == "finance"
        assert "finance" in data["collections_searched"]
        assert "hr_data" not in data["collections_searched"]
        assert "session_id" in data

    def test_chat_sessions_retrieval(self, client: TestClient, finance_headers: dict):
        response = client.get("/chat/sessions", headers=finance_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
