"""
FinSolve Technologies — End-to-End (E2E) Integration Tests
Full workflow simulations covering:
1. Complete User Journey: Login -> Profile -> Multi-Turn Chat -> History -> Rename -> Delete Session
2. Department Knowledge Lifecycle: Create Dept -> Physical Disk Provision -> Upload File -> Vector Store Re-indexing -> Delete
3. User Administration Lifecycle: Create User -> Auth with New User -> RBAC Enforcement -> Deactivate -> Block -> Delete -> Root Safeguards
4. Cross-Department RBAC Isolation: Strict domain isolation and anti-leakage verification
"""

import io
import pytest
from fastapi.testclient import TestClient


# ── Journey 1: Full Chat & Session Lifecycle E2E ───────────────────────────────

class TestChatSessionLifecycleE2E:
    def test_full_chat_session_lifecycle(self, client: TestClient):
        # Step 1: User logs in with raw credentials
        login_res = client.post(
            "/auth/login",
            data={"username": "alice_finance", "password": "finance123"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Step 2: Verify live profile with the acquired token
        me_res = client.get("/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["username"] == "alice_finance"
        assert me_res.json()["role"] == "finance"

        # Step 3: Initiate first turn of conversation
        chat_res1 = client.post(
            "/chat",
            json={"message": "What is our general company expense reimbursement policy?"},
            headers=headers,
        )
        assert chat_res1.status_code == 200
        data1 = chat_res1.json()
        assert "answer" in data1
        assert len(data1["answer"]) > 0
        session_id = data1["session_id"]
        assert session_id is not None
        assert "finance" in data1["collections_searched"]

        # Step 4: Continue conversation in the same session thread
        chat_res2 = client.post(
            "/chat",
            json={"message": "And how do I submit receipts?", "session_id": session_id},
            headers=headers,
        )
        assert chat_res2.status_code == 200
        data2 = chat_res2.json()
        assert data2["session_id"] == session_id

        # Step 5: Verify the thread is listed in user's sessions
        sessions_res = client.get("/chat/sessions", headers=headers)
        assert sessions_res.status_code == 200
        session_list = sessions_res.json()
        matched = [s for s in session_list if s["session_id"] == session_id]
        assert len(matched) == 1

        # Step 6: Retrieve full message history of the thread
        detail_res = client.get(f"/chat/sessions/{session_id}", headers=headers)
        assert detail_res.status_code == 200
        messages = detail_res.json().get("messages", [])
        assert len(messages) >= 4  # 2 user queries + 2 assistant answers

        # Step 7: Rename the conversation thread
        rename_res = client.patch(
            f"/chat/sessions/{session_id}",
            json={"title": "Expense Policy Q&A"},
            headers=headers,
        )
        assert rename_res.status_code == 200
        assert rename_res.json()["title"] == "Expense Policy Q&A"

        # Step 8: Delete the conversation thread
        delete_res = client.delete(f"/chat/sessions/{session_id}", headers=headers)
        assert delete_res.status_code == 204

        # Verify thread is deleted
        get_deleted = client.get(f"/chat/sessions/{session_id}", headers=headers)
        assert get_deleted.status_code == 404


# ── Journey 2: Department Knowledge & Vector Re-Indexing E2E ───────────────────

class TestDepartmentKnowledgeLifecycleE2E:
    def test_department_knowledge_full_lifecycle(self, client: TestClient, root_headers: dict, finance_headers: dict):
        test_dept_id = "e2e_compliance"

        # Ensure clean state in case of leftover from prior run
        client.delete(f"/admin/departments/{test_dept_id}", headers=root_headers)

        # Step 1: Root creates new department
        create_res = client.post(
            "/admin/departments",
            json={
                "name": "E2E Compliance",
                "description": "Enterprise Regulatory Compliance & Risk Management",
                "image": "⚖️",
                "id": test_dept_id,
            },
            headers=root_headers,
        )
        assert create_res.status_code == 200
        assert create_res.json()["id"] == test_dept_id

        # Step 2: Verify starter overview.txt is provisioned on disk
        files_res = client.get(f"/admin/departments/{test_dept_id}/files", headers=root_headers)
        assert files_res.status_code == 200
        files = files_res.json()
        filenames = [f["filename"] for f in files]
        assert "overview.txt" in filenames

        # Step 3: Root uploads a new domain document
        file_content = b"COMPLIANCE POLICY 2026: All employees must complete annual AML audit by Q3."
        upload_res = client.post(
            f"/admin/departments/{test_dept_id}/upload",
            files={"file": ("aml_policy.txt", io.BytesIO(file_content), "text/plain")},
            headers=root_headers,
        )
        assert upload_res.status_code == 200
        upload_data = upload_res.json()
        assert upload_data["filename"] == "aml_policy.txt"
        assert upload_data["chunks_ingested"] >= 1

        # Step 4: Verify the uploaded file is present in department file listing
        files_res2 = client.get(f"/admin/departments/{test_dept_id}/files", headers=root_headers)
        assert files_res2.status_code == 200
        updated_filenames = [f["filename"] for f in files_res2.json()]
        assert "aml_policy.txt" in updated_filenames

        # Step 5: RBAC boundary check — Finance user should NOT have access to compliance collection
        chat_finance = client.post(
            "/chat",
            json={"message": "What is the AML compliance deadline?"},
            headers=finance_headers,
        )
        assert chat_finance.status_code == 200
        assert test_dept_id not in chat_finance.json()["collections_searched"]

        # Step 6: Root deletes the uploaded document
        del_file_res = client.delete(
            f"/admin/departments/{test_dept_id}/files/aml_policy.txt",
            headers=root_headers,
        )
        assert del_file_res.status_code == 200

        # Verify file removed from department file list
        files_res3 = client.get(f"/admin/departments/{test_dept_id}/files", headers=root_headers)
        assert "aml_policy.txt" not in [f["filename"] for f in files_res3.json()]

        # Step 7: Root purges the department
        del_dept_res = client.delete(f"/admin/departments/{test_dept_id}", headers=root_headers)
        assert del_dept_res.status_code in [200, 204]

        # Verify department no longer exists
        get_dept_res = client.get(f"/admin/departments/{test_dept_id}/files", headers=root_headers)
        assert get_dept_res.status_code == 404


# ── Journey 3: User Provisioning & Administration Lifecycle E2E ────────────────

class TestUserProvisioningLifecycleE2E:
    def test_user_provisioning_and_safeguards(self, client: TestClient, root_headers: dict):
        test_username = "e2e_analyst"

        # Cleanup if leftover
        client.delete(f"/admin/users/{test_username}", headers=root_headers)

        # Step 1: Root creates new user
        create_res = client.post(
            "/admin/users",
            json={
                "username": test_username,
                "password": "Password123!",
                "role": "finance",
                "full_name": "E2E Analyst User",
                "departmentId": "finance",
            },
            headers=root_headers,
        )
        assert create_res.status_code == 200
        assert create_res.json()["username"] == test_username
        assert create_res.json()["is_active"] is True

        # Step 2: Newly created user logs in
        login_res = client.post(
            "/auth/login",
            data={"username": test_username, "password": "Password123!"},
        )
        assert login_res.status_code == 200
        new_token = login_res.json()["access_token"]
        new_headers = {"Authorization": f"Bearer {new_token}"}

        # Step 3: Newly created user queries their profile
        me_res = client.get("/auth/me", headers=new_headers)
        assert me_res.status_code == 200
        assert me_res.json()["username"] == test_username

        # Step 4: Newly created non-admin user attempts admin operation
        forbidden_res = client.get("/admin/users", headers=new_headers)
        assert forbidden_res.status_code == 403

        # Step 5: Root deactivates the user
        deactivate_res = client.put(
            f"/admin/users/{test_username}",
            json={"is_active": False},
            headers=root_headers,
        )
        assert deactivate_res.status_code == 200
        assert deactivate_res.json()["is_active"] is False

        # Step 6: Deactivated user attempts to use existing token -> 401 Unauthorized
        blocked_res = client.get("/auth/me", headers=new_headers)
        assert blocked_res.status_code == 401
        assert "inactive" in blocked_res.json()["detail"].lower()

        # Step 7: Root deletes the user
        delete_res = client.delete(f"/admin/users/{test_username}", headers=root_headers)
        assert delete_res.status_code in [200, 204]

        # Step 8: Root account protection safeguards
        # Deleting root is forbidden
        del_root_res = client.delete("/admin/users/root", headers=root_headers)
        assert del_root_res.status_code == 400
        assert "cannot be deleted" in del_root_res.json()["detail"].lower()

        # Deactivating root is forbidden
        deact_root_res = client.put("/admin/users/root", json={"is_active": False}, headers=root_headers)
        assert deact_root_res.status_code == 400
        assert "cannot be deactivated" in deact_root_res.json()["detail"].lower()


# ── Journey 4: Cross-Department RBAC Boundary & Anti-Leakage E2E ──────────────

class TestCrossDepartmentBoundaryE2E:
    def test_engineering_user_cannot_access_hr_collections(self, client: TestClient, eng_headers: dict):
        response = client.post(
            "/chat",
            json={"message": "Show me the compensation and bonus data for all executives."},
            headers=eng_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "engineering"
        # Must only search engineering and general
        assert "engineering" in data["collections_searched"]
        assert "general" in data["collections_searched"]
        assert "hr_data" not in data["collections_searched"]
        assert "finance" not in data["collections_searched"]

    def test_marketing_user_cannot_access_finance_collections(self, client: TestClient, marketing_headers: dict):
        response = client.post(
            "/chat",
            json={"message": "What is the breakdown of engineering cloud server costs?"},
            headers=marketing_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "marketing"
        assert "marketing" in data["collections_searched"]
        assert "finance" not in data["collections_searched"]
        assert "engineering" not in data["collections_searched"]
