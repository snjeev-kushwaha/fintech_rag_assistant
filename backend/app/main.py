"""
FinSolve Technologies — RAG RBAC Chatbot
FastAPI Application Entrypoint with Enterprise Security Hardening
"""

import sys
from pathlib import Path

# Add project root and backend dir to sys.path so imports work from any execution context
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

for p in [str(PROJECT_ROOT), str(BACKEND_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.middleware import SecurityHeadersMiddleware, LoginRateLimitMiddleware
from backend.app.api.router import api_router
from backend.app.db.departments_store import initialize_departments_db
from backend.app.db.users_store import initialize_users_db
from backend.app.db.vector_store import list_collections
from backend.app.services.rag_service import get_rag_pipeline

# ── FastAPI App Factory ───────────────────────────────────────────────────────

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

# ── Security Middlewares ──────────────────────────────────────────────────────

# 1. Custom HTTP Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# 2. Login Brute-Force Rate Limiter
app.add_middleware(LoginRateLimitMiddleware)

# 3. Explicit CORS Policy (Restricted to known client hosts)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8501",
    "http://127.0.0.1:8501",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# ── Register Modular API Routers ──────────────────────────────────────────────

app.include_router(api_router)


# ── Startup Event ─────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """Pre-warm the RAG pipeline and initialize database on startup."""
    print("[API] FinSolve RBAC Chatbot starting up with security middleware...")
    print(f"[API] Backend URL: {settings.backend_url}")
    initialize_departments_db()
    initialize_users_db()
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

    print("[API] [READY] FinSolve RBAC Chatbot is ready and secured!")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=True,
        log_level="info",
        app_dir=str(PROJECT_ROOT),
    )
