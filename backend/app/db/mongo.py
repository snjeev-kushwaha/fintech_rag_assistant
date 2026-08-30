"""
FinSolve Technologies — MongoDB Connection & Collections
"""

from typing import Optional
from pymongo import MongoClient
from backend.app.core.config import settings

_mongo_client: Optional[MongoClient] = None


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


def get_users_collection():
    """Get MongoDB users collection."""
    return get_db()["users"]


def get_departments_collection():
    """Get MongoDB departments collection."""
    return get_db()["departments"]


def get_chat_sessions_collection():
    """Get MongoDB chat_sessions collection with index ensured."""
    db = get_db()
    col = db["chat_sessions"]
    col.create_index([("username", 1), ("updated_at", -1)])
    return col
