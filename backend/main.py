"""
FinSolve Technologies — RAG RBAC Chatbot
FastAPI Backend — Main Application
"""

from datetime import timedelta

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File  # pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware  # pyrefly: ignore [missing-import]
from fastapi.security import OAuth2PasswordRequestForm  # pyrefly: ignore [missing-import]

from backend.auth import authenticate_user, create_access_token, get_current_user, require_root
from backend.config import settings, DATA_DIR
from backend.models import (
    TokenResponse,
    ChatRequest,
    ChatResponse,
    HealthResponse,
    UserInfo,
    UserCreate,
    UserUpdate,
    UserAdminResponse,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    ROLE_DISPLAY_NAMES,
    ROLE_COLORS,
    ROLE_EMOJIS,
)
from backend.rag_pipeline import get_rag_pipeline
from backend.vector_store import list_collections, ingest_single_file
from backend.users_store import (
    load_all_users,
    create_user_record,
    update_user_record,
    delete_user_record,
)
from backend.departments_store import (
    load_all_departments,
    create_department_record,
    update_department_record,
    delete_department_record,
    get_department_user_count,
    initialize_departments_db,
)


# ── FastAPI App ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="FinSolve RBAC Chatbot API",
    description=(
        "Role-Based Access Control RAG Chatbot for FinSolve Technologies. "
        "Provides secure, department-specific AI responses based on user roles."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Streamlit & React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8501", "http://127.0.0.1:8501", "http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Check API health and list loaded vector store collections."""
    collections = list_collections()
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        collections_loaded=collections,
    )


# ── Authentication Endpoints ──────────────────────────────────────────────────

@app.post("/auth/login", response_model=TokenResponse, tags=["Authentication"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user with username/password.
    Returns a JWT access token and the user's role information.
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        display_name=ROLE_DISPLAY_NAMES.get(user.role, user.role),
        username=user.username,
        role_color=ROLE_COLORS.get(user.role, "#94a3b8"),
        role_emoji=ROLE_EMOJIS.get(user.role, "👤"),
    )


@app.get("/auth/me", response_model=UserInfo, tags=["Authentication"])
async def get_me(current_user: UserInfo = Depends(get_current_user)):
    """Return current authenticated user's info and role."""
    return current_user


from backend.chat_history_store import (
    get_user_chat_sessions,
    get_chat_session_by_id,
    create_or_update_chat_session,
    delete_chat_session,
)


# ── Chat & Session Endpoints ──────────────────────────────────────────────────

@app.get("/chat/sessions", tags=["Chat"])
async def list_chat_sessions(current_user: UserInfo = Depends(get_current_user)):
    """Get all saved MongoDB chat session threads for current user."""
    return get_user_chat_sessions(current_user.username)


@app.get("/chat/sessions/{session_id}", tags=["Chat"])
async def get_chat_session(session_id: str, current_user: UserInfo = Depends(get_current_user)):
    """Get full chat session thread with all messages from MongoDB."""
    doc = get_chat_session_by_id(session_id, current_user.username)
    if not doc:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return doc


@app.delete("/chat/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Chat"])
async def delete_chat_session_endpoint(session_id: str, current_user: UserInfo = Depends(get_current_user)):
    """Delete chat session thread from MongoDB."""
    success = delete_chat_session(session_id, current_user.username)
    if not success:
        raise HTTPException(status_code=404, detail="Chat session not found")


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
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

    # Get the RAG pipeline and run the query
    pipeline = get_rag_pipeline()
    result = pipeline.query(
        user_query=request.message,
        role=current_user.role,
    )

    sources_dicts = [s.model_dump() if hasattr(s, "model_dump") else s.dict() for s in result["sources"]]

    # Save conversation exchange into MongoDB
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


@app.post("/chat/upload", tags=["Chat"])
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

    role_dept_map = {
        "finance": "finance",
        "marketing": "marketing",
        "hr": "hr",
        "engineering": "engineering",
        "executive": "general",
        "employee": "general",
        "root": "general",
    }
    dept_folder = role_dept_map.get(current_user.role, "general")
    target_dir = DATA_DIR / dept_folder
    target_dir.mkdir(parents=True, exist_ok=True)

    file_path = target_dir / file.filename
    try:
        contents = await file.read()
        file_path.write_bytes(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    chunks_ingested = ingest_single_file(file_path, dept_folder)

    return {
        "filename": file.filename,
        "department": dept_folder,
        "file_path": str(file_path),
        "chunks_ingested": chunks_ingested,
        "message": f"Document '{file.filename}' uploaded to {dept_folder.title()} department data folder and indexed into knowledge base."
    }


# ── Department Endpoints ───────────────────────────────────────────────────────

@app.get("/admin/departments", response_model=list[DepartmentResponse], tags=["Administration"])
async def get_departments(user: UserInfo = Depends(get_current_user)):
    """List all corporate departments with dynamic user counts."""
    depts = load_all_departments()
    return [
        DepartmentResponse(
            id=d.id,
            name=d.name,
            description=d.description,
            image=d.image,
            status=d.status,
            createdBy=d.createdBy,
            createdAt=d.createdAt,
            updatedAt=d.updatedAt,
            user_count=get_department_user_count(d.id),
        )
        for d in depts
    ]


@app.post("/admin/departments", response_model=DepartmentResponse, tags=["Administration"])
async def create_department(request: DepartmentCreate, admin: UserInfo = Depends(require_root)):
    """Create a new corporate department in MongoDB."""
    try:
        new_dept = create_department_record(
            name=request.name,
            description=request.description,
            image=request.image,
            status=request.status or "Active",
            created_by=admin.username,
            custom_id=request.id,
        )
        return DepartmentResponse(
            id=new_dept.id,
            name=new_dept.name,
            description=new_dept.description,
            image=new_dept.image,
            status=new_dept.status,
            createdBy=new_dept.createdBy,
            createdAt=new_dept.createdAt,
            updatedAt=new_dept.updatedAt,
            user_count=0,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@app.put("/admin/departments/{dept_id}", response_model=DepartmentResponse, tags=["Administration"])
async def update_department(dept_id: str, request: DepartmentUpdate, admin: UserInfo = Depends(require_root)):
    """Update department details in MongoDB."""
    try:
        updated = update_department_record(
            dept_id=dept_id,
            name=request.name,
            description=request.description,
            image=request.image,
            status=request.status,
        )
        return DepartmentResponse(
            id=updated.id,
            name=updated.name,
            description=updated.description,
            image=updated.image,
            status=updated.status,
            createdBy=updated.createdBy,
            createdAt=updated.createdAt,
            updatedAt=updated.updatedAt,
            user_count=get_department_user_count(updated.id),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@app.delete("/admin/departments/{dept_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Administration"])
async def delete_department(dept_id: str, admin: UserInfo = Depends(require_root)):
    """Delete a department (fails if users are currently assigned)."""
    try:
        delete_department_record(dept_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# ── Control Center / Admin User Endpoints ─────────────────────────────────────

@app.get("/admin/users", response_model=list[UserAdminResponse], tags=["Administration"])
async def get_users(user: UserInfo = Depends(get_current_user)):
    """List all registered users in the persistent database."""
    users = load_all_users()
    return [
        UserAdminResponse(
            username=u.username,
            role=u.role,
            full_name=u.full_name,
            is_active=u.is_active,
            departmentId=getattr(u, "departmentId", u.role),
        )
        for u in users.values()
    ]


@app.post("/admin/users", response_model=UserAdminResponse, tags=["Administration"])
async def create_user(request: UserCreate, admin: UserInfo = Depends(require_root)):
    """Register a new user inside the persistent database."""
    try:
        new_rec = create_user_record(
            username=request.username.strip(),
            password_raw=request.password,
            role=request.role.value if hasattr(request.role, "value") else str(request.role),
            full_name=request.full_name.strip(),
            department_id=request.departmentId,
        )
        return UserAdminResponse(
            username=new_rec.username,
            role=new_rec.role,
            full_name=new_rec.full_name,
            is_active=new_rec.is_active,
            departmentId=new_rec.departmentId,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@app.put("/admin/users/{username}", response_model=UserAdminResponse, tags=["Administration"])
async def update_user(
    username: str,
    request: UserUpdate,
    admin: UserInfo = Depends(require_root),
):
    """Update a user's role, name, status, or password in the database."""
    try:
        updated_rec = update_user_record(
            username=username,
            password_raw=request.password,
            role=request.role.value if hasattr(request.role, "value") and request.role else (str(request.role) if request.role else None),
            full_name=request.full_name.strip() if request.full_name else None,
            is_active=request.is_active,
            department_id=request.departmentId,
        )
        return UserAdminResponse(
            username=updated_rec.username,
            role=updated_rec.role,
            full_name=updated_rec.full_name,
            is_active=updated_rec.is_active,
            departmentId=updated_rec.departmentId,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@app.delete("/admin/users/{username}", status_code=status.HTTP_204_NO_CONTENT, tags=["Administration"])
async def delete_user(username: str, admin: UserInfo = Depends(require_root)):
    """Delete a user account (system administrator account cannot be deleted)."""
    try:
        delete_user_record(username)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# ── Startup Event ─────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """Pre-warm the RAG pipeline on startup."""
    print("[API] FinSolve RBAC Chatbot starting up...")
    print(f"[API] Backend URL: {settings.backend_url}")
    initialize_departments_db()
    collections = list_collections()
    if not collections:
        print("[API] [WARN] No vector collections found. Run: python scripts/ingest_data.py")
    else:
        print(f"[API] [OK] Vector collections loaded: {collections}")

    # Pre-initialize the RAG pipeline
    try:
        get_rag_pipeline()
        print("[API] [OK] RAG pipeline initialized successfully")
    except Exception as e:
        print(f"[API] [WARN] RAG pipeline init warning: {e}")

    print("[API] [READY] FinSolve RBAC Chatbot is ready!")


if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True,
        log_level="info",
    )
