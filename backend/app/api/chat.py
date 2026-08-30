"""
Chat and session endpoints: RAG chat inference, session history & document attachments.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from backend.app.core.config import DATA_DIR
from backend.app.core.security import get_current_user
from backend.app.models.schemas import (
    ChatRequest,
    ChatResponse,
    UserInfo,
)
from backend.app.services.rag_service import get_rag_pipeline
from backend.app.db.vector_store import ingest_single_file
from backend.app.db.chat_store import (
    get_user_chat_sessions,
    get_chat_session_by_id,
    create_or_update_chat_session,
    delete_chat_session,
    rename_chat_session,
)
from backend.app.models.schemas import (
    ChatRequest,
    ChatResponse,
    UserInfo,
    RenameSessionRequest,
)

router = APIRouter(tags=["Chat"])


@router.get("/chat/sessions")
async def list_chat_sessions(current_user: UserInfo = Depends(get_current_user)):
    """Get all saved MongoDB chat session threads for current user."""
    return get_user_chat_sessions(current_user.username)


@router.get("/chat/sessions/{session_id}")
async def get_chat_session(session_id: str, current_user: UserInfo = Depends(get_current_user)):
    """Get full chat session thread with all messages from MongoDB."""
    doc = get_chat_session_by_id(session_id, current_user.username)
    if not doc:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return doc


@router.patch("/chat/sessions/{session_id}")
async def rename_chat_session_endpoint(
    session_id: str,
    payload: RenameSessionRequest,
    current_user: UserInfo = Depends(get_current_user),
):
    """Rename an existing chat session thread."""
    if not payload.title or not payload.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    updated = rename_chat_session(session_id, current_user.username, payload.title.strip())
    if not updated:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return updated


@router.delete("/chat/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_session_endpoint(session_id: str, current_user: UserInfo = Depends(get_current_user)):
    """Delete chat session thread from MongoDB."""
    success = delete_chat_session(session_id, current_user.username)
    if not success:
        raise HTTPException(status_code=404, detail="Chat session not found")


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: UserInfo = Depends(get_current_user),
):
    """
    Process a user query through the RAG pipeline and persist conversation to MongoDB.
    Access is automatically scoped to the user's role via RBAC.
    """
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty",
        )

    pipeline = get_rag_pipeline()
    result = pipeline.query(
        user_query=request.message,
        role=current_user.role,
    )

    sources_dicts = [s.model_dump() if hasattr(s, "model_dump") else s.dict() for s in result["sources"]]

    session_doc = create_or_update_chat_session(
        username=current_user.username,
        user_query=request.message,
        answer=result["answer"],
        sources=sources_dicts,
        session_id=request.session_id,
    )

    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        role=current_user.role,
        collections_searched=result["collections_searched"],
        session_id=session_doc["session_id"],
    )


from backend.app.core.security_utils import (
    sanitize_filename,
    safe_resolve_data_path,
    validate_file_size,
)

@router.post("/chat/upload")
async def upload_attachment(
    file: UploadFile = File(...),
    current_user: UserInfo = Depends(get_current_user),
):
    """
    Upload a document file into the user's department folder inside backend/data/<department>/
    and index it into ChromaDB vector store.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    if current_user.role == "root":
        dept_folder = "general"
    else:
        dept_folder = current_user.role.lower()

    safe_filename = sanitize_filename(file.filename)
    file_path = safe_resolve_data_path(dept_folder, safe_filename)
    file_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        contents = await file.read()
        validate_file_size(contents)
        file_path.write_bytes(contents)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    chunks_ingested = ingest_single_file(file_path, dept_folder)

    return {
        "filename": safe_filename,
        "department": dept_folder,
        "file_path": str(file_path),
        "chunks_ingested": chunks_ingested,
        "message": f"Document '{safe_filename}' uploaded to {dept_folder.title()} department data folder and indexed into knowledge base."
    }
