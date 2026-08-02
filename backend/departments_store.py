import re
from datetime import datetime, timezone
from typing import Optional
from backend.users_store import get_mongo_client, get_users_collection
from backend.config import settings


def get_departments_collection():
    client = get_mongo_client()
    db = client[settings.mongo_db_name]
    return db["departments"]


class DepartmentRecord:
    def __init__(
        self,
        id: str,
        name: str,
        description: str,
        image: str = "🏢",
        status: str = "Active",
        createdBy: str = "root",
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None,
    ):
        now_iso = datetime.now(timezone.utc).isoformat()
        self.id = id
        self.name = name
        self.description = description
        self.image = image or "🏢"
        self.status = status or "Active"
        self.createdBy = createdBy or "root"
        self.createdAt = createdAt or now_iso
        self.updatedAt = updatedAt or now_iso

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "image": self.image,
            "status": self.status,
            "createdBy": self.createdBy,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "DepartmentRecord":
        return cls(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            image=data.get("image", "🏢"),
            status=data.get("status", "Active"),
            createdBy=data.get("createdBy", "root"),
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt"),
        )


def initialize_departments_db():
    """Seed default corporate departments into MongoDB if empty."""
    col = get_departments_collection()
    if col.count_documents({}) > 0:
        return

    now_iso = datetime.now(timezone.utc).isoformat()
    default_departments = [
        {
            "id": "finance",
            "name": "Finance Team",
            "description": "Manages corporate financial planning, budgets, expense limits, and quarterly revenue reporting.",
            "image": "💰",
            "status": "Active",
            "createdBy": "root",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "marketing",
            "name": "Marketing & Sales",
            "description": "Drives brand marketing campaigns, customer NPS feedback analysis, product launches, & lead conversion.",
            "image": "📈",
            "status": "Active",
            "createdBy": "root",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "hr",
            "name": "Human Resources",
            "description": "Handles employee onboarding, headcount tracking, salary brackets, performance reviews, & HR policies.",
            "image": "👥",
            "status": "Active",
            "createdBy": "root",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "engineering",
            "name": "Engineering Department",
            "description": "Builds core microservices, CI/CD deployment pipelines, system architecture, & manages P0 production alerts.",
            "image": "⚙️",
            "status": "Active",
            "createdBy": "root",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "executive",
            "name": "Executive Board",
            "description": "C-Level strategic decision making, corporate governance, enterprise risk oversight, & executive metrics.",
            "image": "👑",
            "status": "Active",
            "createdBy": "root",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
        {
            "id": "employee",
            "name": "General / Operations",
            "description": "General company policy guidelines, workplace tools, office facilities, & administrative operations.",
            "image": "🏢",
            "status": "Active",
            "createdBy": "root",
            "createdAt": now_iso,
            "updatedAt": now_iso,
        },
    ]

    col.insert_many(default_departments)


def load_all_departments() -> list[DepartmentRecord]:
    """Load all departments from MongoDB."""
    col = get_departments_collection()
    if col.count_documents({}) == 0:
        initialize_departments_db()

    depts = []
    try:
        for doc in col.find():
            depts.append(DepartmentRecord.from_dict(doc))
    except Exception as e:
        print(f"[DepartmentsStore] Error loading departments: {e}")
    return depts


def get_department_by_id(dept_id: str) -> Optional[DepartmentRecord]:
    col = get_departments_collection()
    if col.count_documents({}) == 0:
        initialize_departments_db()

    doc = col.find_one({"id": dept_id})
    if not doc:
        return None
    return DepartmentRecord.from_dict(doc)


def get_department_user_count(dept_id: str) -> int:
    """Calculate dynamic user count assigned to this department."""
    users_col = get_users_collection()
    return users_col.count_documents({
        "$or": [
            {"departmentId": dept_id},
            {"role": dept_id}
        ]
    })


def create_department_record(
    name: str,
    description: str,
    image: Optional[str] = "🏢",
    status: str = "Active",
    created_by: str = "root",
    custom_id: Optional[str] = None,
) -> DepartmentRecord:
    col = get_departments_collection()

    # Enforce unique name check with regex escaping
    escaped_name = re.escape(name.strip())
    if col.find_one({"name": {"$regex": f"^{escaped_name}$", "$options": "i"}}):
        raise ValueError(f"Department with name '{name.strip()}' already exists.")

    if custom_id and custom_id.strip():
        dept_id = re.sub(r'[^a-zA-Z0-9_]', '', custom_id.strip().lower())
    else:
        dept_id = re.sub(r'[^a-zA-Z0-9_]', '_', name.strip().lower().replace(" ", "_"))
        dept_id = re.sub(r'_+', '_', dept_id).strip('_')

    if not dept_id:
        dept_id = f"dept_{int(datetime.now(timezone.utc).timestamp())}"

    if col.find_one({"id": dept_id}):
        dept_id = f"{dept_id}_{int(datetime.now(timezone.utc).timestamp())}"

    now_iso = datetime.now(timezone.utc).isoformat()
    new_dept = DepartmentRecord(
        id=dept_id,
        name=name.strip(),
        description=description.strip(),
        image=image or "🏢",
        status=status or "Active",
        createdBy=created_by,
        createdAt=now_iso,
        updatedAt=now_iso,
    )

    col.insert_one(new_dept.to_dict())
    return new_dept


def update_department_record(
    dept_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    image: Optional[str] = None,
    status: Optional[str] = None,
) -> DepartmentRecord:
    col = get_departments_collection()
    existing = col.find_one({"id": dept_id})
    if not existing:
        raise ValueError(f"Department '{dept_id}' not found.")

    update_fields = {}
    if name is not None and name.strip():
        # Check name uniqueness if changed
        escaped_name = re.escape(name.strip())
        dup = col.find_one({
            "name": {"$regex": f"^{escaped_name}$", "$options": "i"},
            "id": {"$ne": dept_id}
        })
        if dup:
            raise ValueError(f"Department name '{name.strip()}' is already taken.")
        update_fields["name"] = name.strip()

    if description is not None and description.strip():
        update_fields["description"] = description.strip()

    if image is not None:
        update_fields["image"] = image

    if status is not None:
        update_fields["status"] = status

    if update_fields:
        update_fields["updatedAt"] = datetime.now(timezone.utc).isoformat()
        col.update_one({"id": dept_id}, {"$set": update_fields})

    updated_doc = col.find_one({"id": dept_id})
    return DepartmentRecord.from_dict(updated_doc)


def delete_department_record(dept_id: str):
    """Delete department if no active users are assigned."""
    count = get_department_user_count(dept_id)
    if count > 0:
        raise ValueError(f"Cannot delete department '{dept_id}' because {count} user(s) are currently assigned to it. Please reassign those users first.")

    col = get_departments_collection()
    res = col.delete_one({"id": dept_id})
    if res.deleted_count == 0:
        raise ValueError(f"Department '{dept_id}' not found.")
