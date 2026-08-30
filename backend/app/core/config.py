"""
FinSolve Technologies — RAG RBAC Chatbot
Core Configuration Management
"""

import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Base directories
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
BASE_DIR = BACKEND_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
CHROMA_DIR = BACKEND_DIR / "chroma_db"


class Settings(BaseSettings):
    # ── LLM ───────────────────────────────────────────────────────────────────
    gemini_api_key: str = "your_gemini_api_key_here"
    gemini_model: str = "gemini-2.0-flash"
    llm_provider: str = "auto"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3"

    # ── Authentication ─────────────────────────────────────────────────────────
    jwt_secret_key: str = "finsolve-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    root_password: str = "root123"

    # ── Vector Store ───────────────────────────────────────────────────────────
    chroma_persist_dir: str = str(CHROMA_DIR)

    # ── Data ───────────────────────────────────────────────────────────────────
    data_dir: str = str(DATA_DIR)

    # ── Server ─────────────────────────────────────────────────────────────────
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    backend_url: str = "http://127.0.0.1:8000"

    # ── RAG ────────────────────────────────────────────────────────────────────
    chunk_size: int = 800
    chunk_overlap: int = 100
    retrieval_top_k: int = 5
    max_distance_threshold: float = 0.65
    embedding_model: str = "all-MiniLM-L6-v2"

    # ── Database ───────────────────────────────────────────────────────────────
    mongo_uri: str = "mongodb://127.0.0.1:27017/"
    mongo_db_name: str = "finsolve_db"

    model_config = {
        "env_file": (BACKEND_DIR / ".env", BASE_DIR / ".env", ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
