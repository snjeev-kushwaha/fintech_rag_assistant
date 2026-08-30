"""
FinSolve Technologies — MongoDB Connection & Collections
"""

from typing import Optional
from pymongo import MongoClient
from backend.app.core.config import settings

_mongo_client: Optional[MongoClient] = None
_indexes_initialized: bool = False


def get_mongo_client() -> MongoClient:
    """Singleton MongoDB client connection."""
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(settings.mongo_uri)
    return _mongo_client


def get_db():
    """Get the active MongoDB database."""
    client = get_mongo_client()
    return client[settings.mongo_db_name]


def ensure_db_indexes():
    """Ensure database schema indexes are initialized for security & performance."""
    global _indexes_initialized
    if _indexes_initialized:
        return
    try:
        db = get_db()
        db["users"].create_index("username", unique=True)
        db["departments"].create_index("id", unique=True)
        db["chat_sessions"].create_index([("username", 1), ("updated_at", -1)])
        _indexes_initialized = True
        print("[MongoDB] Security & performance indexes initialized.")
    except Exception as e:
        print(f"[MongoDB] Index initialization notice: {e}")


def get_users_collection():
    """Get MongoDB users collection."""
    ensure_db_indexes()
    return get_db()["users"]


def get_departments_collection():
    """Get MongoDB departments collection."""
    ensure_db_indexes()
    return get_db()["departments"]


def get_chat_sessions_collection():
    """Get MongoDB chat_sessions collection."""
    ensure_db_indexes()
    return get_db()["chat_sessions"]
