"""
FinSolve Technologies — MongoDB Roles Repository
Dynamic database-managed roles replacing static enums.
"""

import re
from datetime import datetime, timezone
from typing import Optional

from backend.app.db.mongo import get_roles_collection, get_users_collection


class RoleRecord:
    def __init__(
        self,
        id: str,
        name: str,
        description: str = "",
        allowed_collections: Optional[list[str]] = None,
        color: str = "#3b82f6",
        is_system: bool = False,
        createdBy: str = "root",
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None,
    ):
        now_iso = datetime.now(timezone.utc).isoformat()
        self.id = id.lower().strip()
        self.name = name.strip()
        self.description = description.strip() if description else ""
        self.allowed_collections = (
            allowed_collections
            if allowed_collections is not None
            else [self.id, "general"]
        )
        self.color = color or "#3b82f6"
        self.is_system = is_system
        self.createdBy = createdBy or "root"
        self.createdAt = createdAt or now_iso
        self.updatedAt = updatedAt or now_iso

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "allowed_collections": self.allowed_collections,
            "color": self.color,
            "is_system": self.is_system,
            "createdBy": self.createdBy,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "RoleRecord":
        return cls(
            id=data["id"],
            name=data["name"],
            description=data.get("description", ""),
            allowed_collections=data.get(
                "allowed_collections", [data["id"], "general"]
            ),
            color=data.get("color", "#3b82f6"),
            is_system=data.get("is_system", False),
            createdBy=data.get("createdBy", "root"),
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt"),
        )


def initialize_roles_db():
    """Seed default enterprise roles into MongoDB if not already present."""
    now_iso = datetime.now(timezone.utc).isoformat()
    default_roles = [
        {
            "id": "root",
            "name": "System Administrator",
            "description": "Full enterprise administrative access and complete data oversight across all departments.",
            "allowed_collections": [
                "finance",
                "marketing",
                "hr_data",
                "engineering",
                "general",
            ],
            "color": "#ef4444",
            "is_system": True,
            "createdBy": "system",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "finance",
            "name": "Finance Team",
            "description": "You have access to: Financial reports, marketing expense budgets, equipment procurement costs, and employee reimbursement data. You also have access to general company information.",
            "allowed_collections": ["finance", "general"],
            "color": "#22c55e",
            "is_system": False,
            "createdBy": "system",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "marketing",
            "name": "Marketing Team",
            "description": "You have access to: Campaign performance data, customer feedback & NPS, and sales metrics. You also have access to general company information.",
            "allowed_collections": ["marketing", "general"],
            "color": "#f97316",
            "is_system": False,
            "createdBy": "system",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "hr",
            "name": "HR Team",
            "description": "You have access to: Employee records & directory, attendance records, payroll data, and performance reviews. You also have access to general company information.",
            "allowed_collections": ["hr_data", "general"],
            "color": "#a855f7",
            "is_system": False,
            "createdBy": "system",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "engineering",
            "name": "Engineering Department",
            "description": "You have access to: Technical architecture documentation, software development processes and CI/CD practices, and operational guidelines & runbooks. You also have access to general company information.",
            "allowed_collections": ["engineering", "general"],
            "color": "#3b82f6",
            "is_system": False,
            "createdBy": "system",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "executive",
            "name": "C-Level Executive",
            "description": "You have FULL ACCESS to all company data including: Financial reports, marketing data, HR records, engineering documentation, and general company information.",
            "allowed_collections": [
                "finance",
                "marketing",
                "hr_data",
                "engineering",
                "general",
            ],
            "color": "#eab308",
            "is_system": False,
            "createdBy": "system",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "employee",
            "name": "Employee",
            "description": "You have access to: General company information only — company policies, events, and FAQs. Sensitive departmental data requires specific role permissions.",
            "allowed_collections": ["general"],
            "color": "#94a3b8",
            "is_system": False,
            "createdBy": "system",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
    ]

    col = get_roles_collection()
    # Strip any legacy emoji fields from existing database documents
    try:
        col.update_many({"emoji": {"$exists": True}}, {"$unset": {"emoji": ""}})
    except Exception:
        pass

    for role_data in default_roles:
        col.update_one(
            {"id": role_data["id"]},
            {"$setOnInsert": role_data},
            upsert=True,
        )


def load_all_roles() -> list[RoleRecord]:
    """Load all roles from MongoDB."""
    col = get_roles_collection()
    if col.count_documents({}) == 0:
        initialize_roles_db()

    # Clean legacy emoji fields if present
    try:
        col.update_many({"emoji": {"$exists": True}}, {"$unset": {"emoji": ""}})
    except Exception:
        pass

    roles = []
    try:
        for doc in col.find():
            roles.append(RoleRecord.from_dict(doc))
    except Exception as e:
        print(f"[RolesStore] Error loading roles: {e}")
    return roles


def get_role_by_id(role_id: str) -> Optional[RoleRecord]:
    """Retrieve a role by its ID from MongoDB."""
    if not role_id:
        return None
    clean_id = str(role_id).strip().lower()
    col = get_roles_collection()
    if col.count_documents({}) == 0:
        initialize_roles_db()

    doc = col.find_one({"id": clean_id})
    if not doc:
        return None
    return RoleRecord.from_dict(doc)


def get_role_user_count(role_id: str) -> int:
    """Calculate the number of users assigned to this role."""
    clean_id = str(role_id).strip().lower()
    users_col = get_users_collection()
    return users_col.count_documents({
        "$or": [
            {"role": clean_id},
            {"role": {"$regex": f"^{re.escape(clean_id)}$", "$options": "i"}},
        ]
    })


def create_role_record(
    name: str,
    description: str = "",
    allowed_collections: Optional[list[str]] = None,
    color: str = "#3b82f6",
    custom_id: Optional[str] = None,
    created_by: str = "root",
) -> RoleRecord:
    """Create a new role in MongoDB."""
    col = get_roles_collection()

    # Check for duplicate role name
    escaped_name = re.escape(name.strip())
    if col.find_one({"name": {"$regex": f"^{escaped_name}$", "$options": "i"}}):
        raise ValueError(f"Role with name '{name.strip()}' already exists.")

    if custom_id and custom_id.strip():
        role_id = re.sub(r"[^a-zA-Z0-9_]", "", custom_id.strip().lower())
    else:
        role_id = re.sub(r"[^a-zA-Z0-9_]", "_", name.strip().lower().replace(" ", "_"))
        role_id = re.sub(r"_+", "_", role_id).strip("_")

    if not role_id:
        role_id = f"role_{int(datetime.now(timezone.utc).timestamp())}"

    if col.find_one({"id": role_id}):
        role_id = f"{role_id}_{int(datetime.now(timezone.utc).timestamp())}"

    collections = allowed_collections if allowed_collections is not None else [role_id, "general"]
    if "general" not in collections and "*" not in collections:
        collections.append("general")

    now_iso = datetime.now(timezone.utc).isoformat()
    new_role = RoleRecord(
        id=role_id,
        name=name.strip(),
        description=description.strip() if description else f"Access to {', '.join(collections)}.",
        allowed_collections=collections,
        color=color or "#3b82f6",
        is_system=False,
        createdBy=created_by,
        createdAt=now_iso,
        updatedAt=now_iso,
    )

    col.insert_one(new_role.to_dict())
    return new_role


def update_role_record(
    role_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    allowed_collections: Optional[list[str]] = None,
    color: Optional[str] = None,
) -> RoleRecord:
    """Update role fields in MongoDB."""
    clean_id = str(role_id).strip().lower()
    col = get_roles_collection()
    existing = col.find_one({"id": clean_id})
    if not existing:
        raise ValueError(f"Role '{clean_id}' not found.")

    update_fields = {}
    if name is not None and name.strip():
        escaped_name = re.escape(name.strip())
        dup = col.find_one({
            "name": {"$regex": f"^{escaped_name}$", "$options": "i"},
            "id": {"$ne": clean_id},
        })
        if dup:
            raise ValueError(f"Role name '{name.strip()}' is already taken.")
        update_fields["name"] = name.strip()

    if description is not None:
        update_fields["description"] = description.strip()

    if allowed_collections is not None:
        cols = list(allowed_collections)
        if "general" not in cols and "*" not in cols:
            cols.append("general")
        update_fields["allowed_collections"] = cols

    if color is not None and color.strip():
        update_fields["color"] = color.strip()

    if update_fields:
        update_fields["updatedAt"] = datetime.now(timezone.utc).isoformat()
        col.update_one({"id": clean_id}, {"$set": update_fields})

    updated_doc = col.find_one({"id": clean_id})
    if not updated_doc:
        raise ValueError(f"Role '{clean_id}' not found after update.")
    return RoleRecord.from_dict(updated_doc)


def delete_role_record(role_id: str):
    """Delete a role from MongoDB if not a protected system role and not assigned to users."""
    clean_id = str(role_id).strip().lower()
    if clean_id == "root":
        raise ValueError("System Administrator (root) role cannot be deleted.")

    col = get_roles_collection()
    existing = col.find_one({"id": clean_id})
    if not existing:
        raise ValueError(f"Role '{clean_id}' not found.")

    if existing.get("is_system", False):
        raise ValueError(f"Role '{clean_id}' is a protected system role and cannot be deleted.")

    assigned_count = get_role_user_count(clean_id)
    if assigned_count > 0:
        raise ValueError(
            f"Cannot delete role '{clean_id}' because {assigned_count} user(s) are currently assigned to it. "
            f"Please reassign those users first."
        )

    res = col.delete_one({"id": clean_id})
    if res.deleted_count == 0:
        raise ValueError(f"Role '{clean_id}' not found.")
