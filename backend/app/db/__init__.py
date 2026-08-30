"""
Database package: MongoDB and ChromaDB repositories.
"""

from backend.app.db.mongo import (
    get_mongo_client,
    get_db,
    get_users_collection,
    get_departments_collection,
    get_chat_sessions_collection,
)
from backend.app.db.users_store import (
    UserRecord,
    initialize_users_db,
    load_all_users,
    get_user_by_username,
    create_user_record,
    update_user_record,
    delete_user_record,
)
from backend.app.db.departments_store import (
    DepartmentRecord,
    initialize_departments_db,
    load_all_departments,
    get_department_by_id,
    get_department_user_count,
    create_department_record,
    update_department_record,
    delete_department_record,
)
from backend.app.db.chat_store import (
    get_user_chat_sessions,
    get_chat_session_by_id,
    create_or_update_chat_session,
    delete_chat_session,
)
from backend.app.db.vector_store import (
    get_chroma_client,
    get_collection,
    list_collections,
    chunk_text,
    ingest_directory,
    query_collections,
    ingest_single_file,
)
