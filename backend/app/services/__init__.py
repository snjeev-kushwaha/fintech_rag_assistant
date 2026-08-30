"""
Services package: RAG AI engine and business logic.
"""

from backend.app.services.rag_service import (
    RAGPipeline,
    get_rag_pipeline,
    check_gemini_validity,
    get_available_ollama_model,
)
