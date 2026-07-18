"""
FinSolve Technologies — RAG RBAC Chatbot
FastAPI Backend — Main Application
"""

from datetime import timedelta

from fastapi import FastAPI, Depends, HTTPException, status  # pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware  # pyrefly: ignore [missing-import]
from fastapi.security import OAuth2PasswordRequestForm  # pyrefly: ignore [missing-import]

from backend.auth import authenticate_user, create_access_token, get_current_user, require_root
from backend.config import settings
from backend.models import (
    TokenResponse,
    ChatRequest,
    ChatResponse,
    HealthResponse,
    UserInfo,
    UserCreate,
    UserUpdate,
    UserAdminResponse,
    ROLE_DISPLAY_NAMES,
    ROLE_COLORS,
    ROLE_EMOJIS,
)
from backend.rag_pipeline import get_rag_pipeline
from backend.vector_store import list_collections
from backend.users_store import (
    load_all_users,
    create_user_record,
    update_user_record,
    delete_user_record,
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

# CORS — allow Streamlit frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8501", "http://127.0.0.1:8501", "*"],
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
        display_name=ROLE_DISPLAY_NAMES[user.role],
        username=user.username,
        role_color=ROLE_COLORS[user.role],
        role_emoji=ROLE_EMOJIS[user.role],
    )


@app.get("/auth/me", response_model=UserInfo, tags=["Authentication"])
async def get_me(current_user: UserInfo = Depends(get_current_user)):
    """Return current authenticated user's info and role."""
    return current_user


# ── Chat Endpoint ─────────────────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(
    request: ChatRequest,
    current_user: UserInfo = Depends(get_current_user),
):
    """
    Process a user query through the RAG pipeline.
    Access is automatically scoped to the user's role via RBAC.
    Returns an AI-generated answer with source citations.
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

    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        role=current_user.role,
        collections_searched=result["collections_searched"],
    )


# ── Control Center / Admin Endpoints ──────────────────────────────────────────

@app.get("/admin/users", response_model=list[UserAdminResponse], tags=["Administration"])
async def get_users(admin: UserInfo = Depends(require_root)):
    """List all registered users in the persistent database."""
    users = load_all_users()
    return [
        UserAdminResponse(
            username=u.username,
            role=u.role,
            full_name=u.full_name,
            is_active=u.is_active,
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
            role=request.role.value,
            full_name=request.full_name.strip(),
        )
        return UserAdminResponse(
            username=new_rec.username,
            role=new_rec.role,
            full_name=new_rec.full_name,
            is_active=new_rec.is_active,
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
            role=request.role.value if request.role else None,
            full_name=request.full_name.strip() if request.full_name else None,
            is_active=request.is_active,
        )
        return UserAdminResponse(
            username=updated_rec.username,
            role=updated_rec.role,
            full_name=updated_rec.full_name,
            is_active=updated_rec.is_active,
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
