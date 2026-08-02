"""
FinSolve Technologies — MongoDB Chat History Store
Production-grade multi-session conversation persistence.
"""

import uuid
from datetime import datetime
from pymongo import DESCENDING  # pyrefly: ignore [missing-import]
from backend.config import settings
from backend.users_store import get_mongo_client


def get_chat_sessions_collection():
    client = get_mongo_client()
    db = client[settings.mongo_db_name]
    collection = db["chat_sessions"]
    # Ensure compound index on username and updated_at
    collection.create_index([("username", 1), ("updated_at", -1)])
    return collection


def get_user_chat_sessions(username: str) -> list[dict]:
    """Get all chat session summaries for a user sorted by most recent first."""
    col = get_chat_sessions_collection()
    cursor = col.find(
        {"username": username},
        {"session_id": 1, "title": 1, "created_at": 1, "updated_at": 1, "_id": 0}
    ).sort("updated_at", DESCENDING)
    return list(cursor)


def get_chat_session_by_id(session_id: str, username: str) -> dict | None:
    """Get full chat session with messages for a specific session_id & username."""
    col = get_chat_sessions_collection()
    doc = col.find_one({"session_id": session_id, "username": username}, {"_id": 0})
    return doc


def create_or_update_chat_session(
    username: str,
    user_query: str,
    answer: str,
    sources: list[dict],
    session_id: str | None = None
) -> dict:
    """
    Save message exchange to database.
    If session_id is None, creates a new session document.
    Returns session dict with session_id, title, and updated messages.
    """
    col = get_chat_sessions_collection()
    now_iso = datetime.utcnow().isoformat()
    now_time = datetime.now().strftime("%I:%M %p")

    user_msg = {
        "role": "user",
        "content": user_query,
        "timestamp": now_time,
        "sources": []
    }
    bot_msg = {
        "role": "bot",
        "content": answer,
        "timestamp": now_time,
        "sources": sources
    }

    if session_id:
        existing = col.find_one({"session_id": session_id, "username": username})
        if existing:
            col.update_one(
                {"session_id": session_id, "username": username},
                {
                    "$push": {"messages": {"$each": [user_msg, bot_msg]}},
                    "$set": {"updated_at": now_iso}
                }
            )
            updated_doc = col.find_one({"session_id": session_id, "username": username}, {"_id": 0})
            return updated_doc

    # Create new chat session document
    new_session_id = f"chat_{uuid.uuid4().hex[:12]}"
    clean_title = user_query.strip()
    if len(clean_title) > 35:
        clean_title = clean_title[:35] + "..."

    session_doc = {
        "session_id": new_session_id,
        "username": username,
        "title": clean_title,
        "created_at": now_iso,
        "updated_at": now_iso,
        "messages": [user_msg, bot_msg]
    }

    col.insert_one(session_doc)
    doc_copy = dict(session_doc)
    doc_copy.pop("_id", None)
    return doc_copy


def delete_chat_session(session_id: str, username: str) -> bool:
    """Delete a chat session from MongoDB."""
    col = get_chat_sessions_collection()
    result = col.delete_one({"session_id": session_id, "username": username})
    return result.deleted_count > 0
