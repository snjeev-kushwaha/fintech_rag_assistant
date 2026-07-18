import os
from typing import Optional
from pathlib import Path
# pyrefly: ignore [missing-import]
from pymongo import MongoClient, ReturnDocument

# pyrefly: ignore [missing-import]
from backend.config import settings
from backend.models import UserRole

# ── MongoDB Client Singleton ──────────────────────────────────────────────────

_mongo_client = None

def get_mongo_client() -> MongoClient:
    global _mongo_client
    if _mongo_client is None:
        # Connect to local MongoDB instance
        _mongo_client = MongoClient(settings.mongo_uri)
    return _mongo_client


def get_users_collection():
    client = get_mongo_client()
    db = client[settings.mongo_db_name]
    return db["users"]


# ── User Records Representation ────────────────────────────────────────────────

class UserRecord:
    def __init__(self, username: str, hashed_password: str, role: str, full_name: str, is_active: bool = True):
        self.username = username
        self.hashed_password = hashed_password
        self.role = role
        self.full_name = full_name
        self.is_active = is_active

    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "hashed_password": self.hashed_password,
            "role": self.role,
            "full_name": self.full_name,
            "is_active": self.is_active,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "UserRecord":
        return cls(
            username=data["username"],
            hashed_password=data["hashed_password"],
            role=data["role"],
            full_name=data["full_name"],
            is_active=data.get("is_active", True),
        )


def _hash_raw_password(password: str) -> str:
    """Helper to hash password locally avoiding circular import."""
    # pyrefly: ignore [missing-import]
    import bcrypt
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def initialize_users_db():
    """Seed the local MongoDB database with default users if empty."""
    col = get_users_collection()
    if col.count_documents({}) > 0:
        return

    # Initialize with default demo users and root user
    root_pwd = getattr(settings, "root_password", "root123")
    initial_users = [
        {
            "username": "root",
            "hashed_password": _hash_raw_password(root_pwd),
            "role": UserRole.ROOT.value,
            "full_name": "System Administrator",
            "is_active": True,
        },
        {
            "username": "alice_finance",
            "hashed_password": _hash_raw_password("finance123"),
            "role": UserRole.FINANCE.value,
            "full_name": "Alice Fernandez",
            "is_active": True,
        },
        {
            "username": "bob_marketing",
            "hashed_password": _hash_raw_password("marketing123"),
            "role": UserRole.MARKETING.value,
            "full_name": "Bob Chatterjee",
            "is_active": True,
        },
        {
            "username": "carol_hr",
            "hashed_password": _hash_raw_password("hr123"),
            "role": UserRole.HR.value,
            "full_name": "Carol Raj",
            "is_active": True,
        },
        {
            "username": "dave_eng",
            "hashed_password": _hash_raw_password("eng123"),
            "role": UserRole.ENGINEERING.value,
            "full_name": "Dave Pillai",
            "is_active": True,
        },
        {
            "username": "tony_cto",
            "hashed_password": _hash_raw_password("executive123"),
            "role": UserRole.EXECUTIVE.value,
            "full_name": "Tony Sharma",
            "is_active": True,
        },
        {
            "username": "employee1",
            "hashed_password": _hash_raw_password("employee123"),
            "role": UserRole.EMPLOYEE.value,
            "full_name": "Rohan Kumar",
            "is_active": True,
        },
    ]

    col.insert_many(initial_users)


def load_all_users() -> dict[str, UserRecord]:
    """Load all users from the MongoDB database."""
    col = get_users_collection()
    if col.count_documents({}) == 0:
        initialize_users_db()

    users = {}
    try:
        for doc in col.find():
            rec = UserRecord.from_dict(doc)
            users[rec.username] = rec
    except Exception as e:
        print(f"[UsersStore] Error loading users from MongoDB: {e}")
    return users


def get_user_by_username(username: str) -> Optional[UserRecord]:
    """Retrieve a user by username from MongoDB."""
    col = get_users_collection()
    if col.count_documents({}) == 0:
        initialize_users_db()

    doc = col.find_one({"username": username})
    if not doc:
        return None
    return UserRecord.from_dict(doc)


def create_user_record(username: str, password_raw: str, role: str, full_name: str) -> UserRecord:
    """Create a new user and persist it in MongoDB."""
    col = get_users_collection()
    if col.find_one({"username": username}):
        raise ValueError(f"User '{username}' already exists.")

    hashed = _hash_raw_password(password_raw)
    new_rec = UserRecord(username=username, hashed_password=hashed, role=role, full_name=full_name)
    col.insert_one(new_rec.to_dict())
    return new_rec


def update_user_record(username: str, password_raw: Optional[str] = None, role: Optional[str] = None, full_name: Optional[str] = None, is_active: Optional[bool] = None) -> UserRecord:
    """Update user fields and persist them in MongoDB."""
    col = get_users_collection()
    update_fields = {}
    if password_raw is not None:
        update_fields["hashed_password"] = _hash_raw_password(password_raw)
    if role is not None:
        update_fields["role"] = role
    if full_name is not None:
        update_fields["full_name"] = full_name
    if is_active is not None:
        update_fields["is_active"] = is_active

    if not update_fields:
        return get_user_by_username(username)

    doc = col.find_one_and_update(
        {"username": username},
        {"$set": update_fields},
        return_document=ReturnDocument.AFTER
    )
    if not doc:
        raise ValueError(f"User '{username}' not found.")
    return UserRecord.from_dict(doc)


def delete_user_record(username: str):
    """Delete a user from the MongoDB database."""
    if username == "root":
        raise ValueError("Cannot delete system administrator account.")
    col = get_users_collection()
    res = col.delete_one({"username": username})
    if res.deleted_count == 0:
        raise ValueError(f"User '{username}' not found.")
