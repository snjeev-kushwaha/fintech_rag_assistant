"""
FinSolve Technologies — Enterprise RBAC RAG Knowledge Platform
Database & Initial System Setup Script

Usage:
    cd d:\\fin-tech\\backend
    python scripts/init_db.py

Initializes MongoDB with the root user and root role.
All departmental roles and user accounts are subsequently created dynamically
from the web Control Center UI.
"""

import sys
import io
from pathlib import Path

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Add project root and backend dir to sys.path
SCRIPTS_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPTS_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

for p in [str(PROJECT_ROOT), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.core.config import settings
from backend.app.db.roles_store import initialize_roles_db, get_role_by_id
from backend.app.db.users_store import initialize_users_db, get_user_by_username
from backend.app.db.departments_store import initialize_departments_db


def main():
    print("=" * 65)
    print("  FinSolve Technologies -- Database & System Initializer")
    print("=" * 65)

    print("\n[1/3] Initializing System Roles (Root Role)...")
    initialize_roles_db()
    root_role = get_role_by_id("root")
    if root_role:
        print(f"      [OK] Root Role verified: '{root_role.name}' (ID: {root_role.id})")
        print(f"           Allowed Collections: {', '.join(root_role.allowed_collections)}")
    else:
        print("      [WARN] Could not verify root role!")

    print("\n[2/3] Initializing System Administrator Account (Root User)...")
    initialize_users_db()
    root_username = settings.root_username
    root_user = get_user_by_username(root_username)
    if root_user:
        print(f"      [OK] Root User verified: '{root_user.username}' (Full Name: {root_user.full_name})")
        print(f"           Role: {root_user.role} | Active: {root_user.is_active}")
    else:
        print("      [WARN] Could not verify root user!")

    print("\n[3/3] Initializing Base Department Structure...")
    initialize_departments_db()
    print("      [OK] Departments structure verified.")

    print("\n" + "=" * 65)
    print("  [SUCCESS] System initialization complete!")
    print("=" * 65)
    print("\n  Admin Login Credentials (loaded from .env):")
    print(f"  * Username: {settings.root_username}")
    print(f"  * Password: {settings.root_password}")
    print("  * Control Center: http://localhost:5173/admin/roles")
    print("\n  All additional roles and users can be dynamically created")
    print("  and managed directly from the Control Center.")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    main()
