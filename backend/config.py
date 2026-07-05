"""
FinSolve Technologies — RAG RBAC Chatbot
Configuration Management
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── LLM ───────────────────────────────────────────────────────────────────
    gemini_api_key: str = "your_gemini_api_key_here"
    gemini_model: str = "gemini-1.5-flash"

    # ── Authentication ─────────────────────────────────────────────────────────
    jwt_secret_key: str = "finsolve-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # ── Vector Store ───────────────────────────────────────────────────────────
    chroma_persist_dir: str = "./chroma_db"

    # ── Data ───────────────────────────────────────────────────────────────────
    data_dir: str = "./data"

    # ── Server ─────────────────────────────────────────────────────────────────
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    backend_url: str = "http://127.0.0.1:8000"

    # ── RAG ────────────────────────────────────────────────────────────────────
    chunk_size: int = 800
    chunk_overlap: int = 100
    retrieval_top_k: int = 5
    embedding_model: str = "all-MiniLM-L6-v2"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()

# Base directory (project root)
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / settings.data_dir.lstrip("./")
CHROMA_DIR = BASE_DIR / settings.chroma_persist_dir.lstrip("./")
