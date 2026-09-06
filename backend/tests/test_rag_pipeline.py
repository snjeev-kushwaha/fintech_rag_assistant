"""
FinSolve Technologies — Unit Tests for RAG Pipeline & Model Self-Healing
"""

import pytest
from backend.app.services.rag_service import (
    RAGPipeline,
    get_rag_pipeline,
    resolve_working_gemini_model,
    check_gemini_validity,
    ROLE_DESCRIPTIONS,
    ROLE_DISPLAY_NAMES,
)
from backend.app.models.schemas import UserRole, SourceDocument
from backend.app.core.config import settings


class TestRAGContextAndSources:
    def setup_method(self):
        self.pipeline = get_rag_pipeline()

    def test_build_context_empty(self):
        context = self.pipeline.build_context([])
        assert context == "No relevant documents found."

    def test_build_context_with_chunks(self):
        chunks = [
            {
                "source_file": "capex_2024.txt",
                "department": "finance",
                "content": "Approved budget is $5M.",
            },
            {
                "source_file": "org_chart.txt",
                "department": "hr_data",
                "content": "HR directory updated.",
            },
        ]
        context = self.pipeline.build_context(chunks)
        assert "capex_2024.txt" in context
        assert "Approved budget is $5M." in context
        assert "Finance Department" in context
        assert "Human Resources" in context

    def test_build_sources_deduplication(self):
        chunks = [
            {
                "source_file": "doc1.txt",
                "department": "finance",
                "content": "Part 1 of document",
            },
            {
                "source_file": "doc1.txt",
                "department": "finance",
                "content": "Part 2 of document",
            },
            {
                "source_file": "doc2.txt",
                "department": "marketing",
                "content": "Marketing info",
            },
        ]
        sources = self.pipeline.build_sources(chunks)
        assert len(sources) == 2  # Deduplicated from 3 to 2
        assert sources[0].source_file == "doc1.txt"
        assert sources[1].source_file == "doc2.txt"

    def test_build_sources_truncation(self):
        long_content = "X" * 350
        chunks = [
            {
                "source_file": "long.txt",
                "department": "engineering",
                "content": long_content,
            }
        ]
        sources = self.pipeline.build_sources(chunks)
        assert len(sources) == 1
        assert sources[0].content_preview.endswith("...")
        assert len(sources[0].content_preview) <= 205


class TestRAGPromptsAndRoles:
    def test_all_user_roles_configured(self):
        for role in [UserRole.FINANCE, UserRole.MARKETING, UserRole.HR, UserRole.ENGINEERING, UserRole.EXECUTIVE, UserRole.EMPLOYEE]:
            assert role in ROLE_DESCRIPTIONS
            assert role in ROLE_DISPLAY_NAMES
            assert len(ROLE_DESCRIPTIONS[role]) > 10
            assert len(ROLE_DISPLAY_NAMES[role]) > 3


class TestGeminiModelResolution:
    def test_invalid_api_key_returns_false(self):
        is_valid, model = resolve_working_gemini_model("invalid_api_key_xyz", "gemini-3.6-flash")
        assert is_valid is False

    def test_empty_api_key_returns_false(self):
        is_valid, model = resolve_working_gemini_model("", "gemini-3.6-flash")
        assert is_valid is False

    def test_placeholder_api_key_returns_false(self):
        is_valid, model = resolve_working_gemini_model("your_gemini_key", "gemini-3.6-flash")
        assert is_valid is False

    def test_active_gemini_model_resolved(self):
        if settings.gemini_api_key and "your_gemini" not in settings.gemini_api_key:
            is_valid, model = resolve_working_gemini_model(settings.gemini_api_key, "gemini-flash-latest")
            assert is_valid is True
            assert isinstance(model, str)
            assert "flash" in model

    def test_deprecated_model_self_healing(self):
        """Simulate a deprecated/retired model; should auto-recover to a working model."""
        if settings.gemini_api_key and "your_gemini" not in settings.gemini_api_key:
            is_valid, resolved_model = resolve_working_gemini_model(
                settings.gemini_api_key, "gemini-2.0-flash"
            )
            assert is_valid is True
            assert resolved_model != "gemini-2.0-flash"
            assert "flash" in resolved_model

    def test_pipeline_singleton(self):
        p1 = get_rag_pipeline()
        p2 = get_rag_pipeline()
        assert p1 is p2
