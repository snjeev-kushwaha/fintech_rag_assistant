"""
FinSolve Technologies — RAG RBAC Chatbot
RAG Pipeline — Retrieval + Augmented Generation
"""

import google.generativeai as genai

from backend.config import settings
from backend.models import UserRole, SourceDocument
from backend.rbac import get_allowed_collections, COLLECTION_LABELS
from backend.vector_store import query_collections


# ── Gemini LLM Setup ──────────────────────────────────────────────────────────

def _configure_gemini():
    genai.configure(api_key=settings.gemini_api_key)


# ── System Prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT_TEMPLATE = """You are FinSolve AI, the intelligent internal knowledge assistant for FinSolve Technologies — a leading FinTech company.

You are currently assisting a user with the role: **{role_display}**

ROLE ACCESS PERMISSIONS:
{role_description}

YOUR INSTRUCTIONS:
1. Answer ONLY based on the provided context documents. Do not fabricate data.
2. If the context does not contain enough information to answer, say so clearly.
3. Be professional, precise, and helpful in your responses.
4. When citing numbers (revenue, headcount, scores, etc.), be specific and accurate.
5. Structure your answers clearly with bullet points or sections when appropriate.
6. Always acknowledge the user's role and what data they have access to.
7. If a user asks about data outside their access level, politely explain they do not have permission to access that information.
8. Reference source documents naturally in your response (e.g., "According to the Financial Report 2024...").

CONTEXT DOCUMENTS:
{context}

Remember: You represent FinSolve Technologies. Be helpful, accurate, and professional."""


ROLE_DESCRIPTIONS = {
    UserRole.FINANCE: "You have access to: Financial reports, marketing expense budgets, equipment procurement costs, and employee reimbursement data. You also have access to general company information.",
    UserRole.MARKETING: "You have access to: Campaign performance data, customer feedback & NPS, and sales metrics. You also have access to general company information.",
    UserRole.HR: "You have access to: Employee records & directory, attendance records, payroll data, and performance reviews. You also have access to general company information.",
    UserRole.ENGINEERING: "You have access to: Technical architecture documentation, software development processes and CI/CD practices, and operational guidelines & runbooks. You also have access to general company information.",
    UserRole.EXECUTIVE: "You have FULL ACCESS to all company data including: Financial reports, marketing data, HR records, engineering documentation, and general company information.",
    UserRole.EMPLOYEE: "You have access to: General company information only — company policies, events, and FAQs. Sensitive departmental data (Finance, HR, Marketing, Engineering) requires specific role permissions.",
}

ROLE_DISPLAY_NAMES = {
    UserRole.FINANCE: "Finance Team Member",
    UserRole.MARKETING: "Marketing Team Member",
    UserRole.HR: "HR Team Member",
    UserRole.ENGINEERING: "Engineering Team Member",
    UserRole.EXECUTIVE: "C-Level Executive",
    UserRole.EMPLOYEE: "Employee",
}


# ── RAG Pipeline ──────────────────────────────────────────────────────────────

class RAGPipeline:
    """
    End-to-end RAG pipeline:
    1. Determine allowed collections for user's role (RBAC)
    2. Retrieve relevant chunks from ChromaDB
    3. Augment query with retrieved context
    4. Generate response via Gemini LLM
    """

    def __init__(self):
        _configure_gemini()
        self._model = genai.GenerativeModel(settings.gemini_model)

    def retrieve(
        self,
        query: str,
        role: UserRole,
        top_k: int = None,
    ) -> tuple[list[dict], list[str]]:
        """
        Retrieve relevant context chunks based on the user's role.
        Returns (chunks, collection_names_searched).
        """
        allowed_collections = get_allowed_collections(role)
        chunks = query_collections(query, allowed_collections, top_k=top_k or settings.retrieval_top_k)
        return chunks, allowed_collections

    def build_context(self, chunks: list[dict]) -> str:
        """Format retrieved chunks into a context string for the LLM prompt."""
        if not chunks:
            return "No relevant documents found in the accessible knowledge base."

        context_parts = []
        seen_sources = set()

        for i, chunk in enumerate(chunks, 1):
            source = chunk["source_file"]
            dept = chunk["department"]
            content = chunk["content"]

            source_label = f"{source} ({COLLECTION_LABELS.get(dept, dept)})"
            context_parts.append(
                f"--- Document {i}: {source_label} ---\n{content}\n"
            )

        return "\n".join(context_parts)

    def generate(
        self,
        query: str,
        chunks: list[dict],
        role: UserRole,
        allowed_collections: list[str],
    ) -> str:
        """
        Generate a response using Gemini with the retrieved context.
        Returns the LLM's text response.
        """
        context = self.build_context(chunks)

        prompt = SYSTEM_PROMPT_TEMPLATE.format(
            role_display=ROLE_DISPLAY_NAMES.get(role, role.value),
            role_description=ROLE_DESCRIPTIONS.get(role, "General access."),
            context=context,
        )

        try:
            response = self._model.generate_content(
                [prompt, f"\n\nUser Question: {query}"],
                generation_config=genai.GenerationConfig(
                    temperature=0.2,
                    max_output_tokens=1500,
                ),
            )
            return response.text
        except Exception as e:
            return (
                f"I encountered an error generating a response: {str(e)}\n\n"
                "Please check that your Gemini API key is configured correctly in the `.env` file."
            )

    def build_sources(self, chunks: list[dict]) -> list[SourceDocument]:
        """Convert raw chunks to SourceDocument models for the API response."""
        sources = []
        seen = set()

        for chunk in chunks:
            source_key = (chunk["source_file"], chunk["department"])
            if source_key not in seen:
                seen.add(source_key)
                preview = chunk["content"][:200].strip()
                if len(chunk["content"]) > 200:
                    preview += "..."
                sources.append(
                    SourceDocument(
                        source_file=chunk["source_file"],
                        department=COLLECTION_LABELS.get(chunk["department"], chunk["department"]),
                        content_preview=preview,
                    )
                )

        return sources

    def query(
        self,
        user_query: str,
        role: UserRole,
    ) -> dict:
        """
        Full RAG pipeline: retrieve → augment → generate.
        Returns a dict with answer, sources, and metadata.
        """
        # Step 1: Retrieve (RBAC-scoped)
        chunks, allowed_collections = self.retrieve(user_query, role)

        # Step 2: Generate response
        answer = self.generate(user_query, chunks, role, allowed_collections)

        # Step 3: Build source citations
        sources = self.build_sources(chunks)

        return {
            "answer": answer,
            "sources": sources,
            "collections_searched": allowed_collections,
            "chunk_count": len(chunks),
        }


# ── Singleton Instance ────────────────────────────────────────────────────────
_rag_pipeline: RAGPipeline | None = None


def get_rag_pipeline() -> RAGPipeline:
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
    return _rag_pipeline
