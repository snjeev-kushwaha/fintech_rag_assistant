"""
FinSolve Technologies — RAG RBAC Chatbot
RAG Pipeline — Retrieval + Augmented Generation
"""

import requests
import google.generativeai as genai  # pyrefly: ignore [missing-import]

from backend.config import settings
from backend.models import UserRole, SourceDocument
from backend.rbac import get_allowed_collections, COLLECTION_LABELS
from backend.vector_store import query_collections


# ── Gemini Validation Helper ──────────────────────────────────────────────────

def check_gemini_validity(api_key: str, model_name: str) -> bool:
    """Check if Google API key is configured, valid, and has available quota."""
    if not api_key or "your_gemini" in api_key or api_key.strip() == "":
        return False
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        # Test short 1-token output to verify key and quota
        model.generate_content("ping", generation_config=genai.GenerationConfig(max_output_tokens=1))
        return True
    except Exception as e:
        print(f"[RAG] Google Gemini API check: {e}")
        return False


def get_available_ollama_model() -> str:
    """Find the best available model in local Ollama container, fallback to settings."""
    try:
        res = requests.get(f"{settings.ollama_base_url.rstrip('/')}/api/tags", timeout=2.0)
        if res.status_code == 200:
            models_data = res.json()
            models = [m["name"] for m in models_data.get("models", [])]
            if models:
                for pref in [settings.ollama_model, "llama3.2:latest", "llama3.2", "llama3:latest", "llama3", "tinyllama:latest", "tinyllama"]:
                    for m in models:
                        if m == pref or m.startswith(pref):
                            return m
                return models[0]
    except Exception:
        pass
    return settings.ollama_model


# ── System Prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT_TEMPLATE = """You are FinSolve AI, the intelligent internal knowledge assistant for FinSolve Technologies.

Assisting Role: **{role_display}**

PERMISSIONS & ACCESS SCOPE:
{role_description}

INSTRUCTIONS:
1. Answer ONLY based on the provided filtered context document snippets.
2. Filter the context to match the user's specific query. Do not output irrelevant data or full dataset dumps.
3. If the context does not contain relevant information for the user's query, state clearly that no matching information was found.
4. Be direct, precise, and concise.

CONTEXT DOCUMENTS:
{context}"""


ROLE_DESCRIPTIONS = {
    UserRole.FINANCE: "You have access to: Financial reports, marketing expense budgets, equipment procurement costs, and employee reimbursement data. You also have access to general company information.",
    UserRole.MARKETING: "You have access to: Campaign performance data, customer feedback & NPS, and sales metrics. You also have access to general company information.",
    UserRole.HR: "You have access to: Employee records & directory, attendance records, payroll data, and performance reviews. You also have access to general company information.",
    UserRole.ENGINEERING: "You have access to: Technical architecture documentation, software development processes and CI/CD practices, and operational guidelines & runbooks. You also have access to general company information.",
    UserRole.EXECUTIVE: "You have FULL ACCESS to all company data including: Financial reports, marketing data, HR records, engineering documentation, and general company information.",
    UserRole.EMPLOYEE: "You have access to: General company information only — company policies, events, and FAQs. Sensitive departmental data requires specific role permissions.",
}

ROLE_DISPLAY_NAMES = {
    UserRole.FINANCE: "Finance Team Member",
    UserRole.MARKETING: "Marketing Team Member",
    UserRole.HR: "HR Team Member",
    UserRole.ENGINEERING: "Engineering Team Member",
    UserRole.EXECUTIVE: "C-Level Executive",
    UserRole.EMPLOYEE: "Employee",
}


# ── RAG Pipeline Class ────────────────────────────────────────────────────────

class RAGPipeline:
    def __init__(self):
        # 1. Check local Ollama container availability (DEFAULT provider)
        self.ollama_available = False
        self.ollama_model = settings.ollama_model
        try:
            res = requests.get(f"{settings.ollama_base_url.rstrip('/')}/api/tags", timeout=2.0)
            if res.status_code == 200:
                self.ollama_available = True
                self.ollama_model = get_available_ollama_model()
                print(f"[RAG] Local Ollama container active. Resolved model: {self.ollama_model}")
        except Exception as e:
            print(f"[RAG] Local Ollama container check: {e}")

        # 2. Check if valid Google API key is configured
        self.gemini_available = check_gemini_validity(settings.gemini_api_key, settings.gemini_model)
        if self.gemini_available:
            self._gemini_model = genai.GenerativeModel(settings.gemini_model)
            print(f"[RAG] Valid Google Gemini API Key configured: {settings.gemini_model}")

        # 3. Determine Provider Routing (Google if valid key configured, DEFAULT to local LLaMA)
        pref = getattr(settings, "llm_provider", "auto").lower()
        if pref == "gemini" and self.gemini_available:
            self.preferred_provider = "gemini"
        elif pref == "ollama":
            self.preferred_provider = "ollama"
        else: # "auto" or default
            if self.gemini_available:
                self.preferred_provider = "gemini"
            else:
                self.preferred_provider = "ollama"

        print(f"[RAG] Active Provider: {self.preferred_provider.upper()} (Model: {self._get_active_model_name()})")

    def _get_active_model_name(self) -> str:
        if self.preferred_provider == "gemini" and self.gemini_available:
            return settings.gemini_model
        return self.ollama_model

    def retrieve(
        self,
        query: str,
        role: UserRole,
        top_k: int = None,
    ) -> tuple[list[dict], list[str]]:
        """
        Retrieve relevant context chunks filtered by user's role and relevance distance.
        Returns (relevant_chunks, collection_names_searched).
        """
        allowed_collections = get_allowed_collections(role)
        # Query vector store with distance threshold filtering
        chunks = query_collections(
            query=query,
            collection_names=allowed_collections,
            top_k=top_k or settings.retrieval_top_k,
            max_distance=getattr(settings, "max_distance_threshold", 0.65),
        )
        return chunks, allowed_collections

    def build_context(self, chunks: list[dict]) -> str:
        """Format retrieved chunks into a context string."""
        if not chunks:
            return "No relevant documents found."

        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            source = chunk["source_file"]
            dept = chunk["department"]
            content = chunk["content"]
            source_label = f"{source} ({COLLECTION_LABELS.get(dept, dept)})"
            context_parts.append(f"--- Relevant Snippet {i}: {source_label} ---\n{content}\n")

        return "\n".join(context_parts)

    def _generate_via_ollama(self, prompt: str, query: str, chunks: list[dict], role_display: str) -> str:
        """Invoke local LLaMA model in Docker via Ollama REST API with fallback to direct chunk synthesis."""
        try:
            body = {
                "model": self.ollama_model,
                "prompt": f"{prompt}\n\nUser Question: {query}\nAnswer:",
                "stream": False,
                "options": {
                    "temperature": 0.3
                }
            }
            res = requests.post(
                f"{settings.ollama_base_url.rstrip('/')}/api/generate",
                json=body,
                timeout=180.0
            )
            if res.status_code == 200:
                answer = res.json().get("response", "").strip()
                if answer:
                    return answer
        except Exception as e:
            print(f"[RAG] Local LLaMA generation attempt ({self.ollama_model}): {e}")

        # Direct synthesis from filtered relevant chunks if chunks present
        if chunks:
            extractive_passages = []
            for i, chunk in enumerate(chunks[:3], 1):
                source = chunk.get("source_file", "Document")
                dept_label = COLLECTION_LABELS.get(chunk.get("department"), chunk.get("department", ""))
                extractive_passages.append(
                    f"**From {source} ({dept_label}):**\n{chunk['content'].strip()}"
                )
            return (
                f"Based on your accessible **{role_display}** knowledge base, here are the matching details for your query:\n\n"
                + "\n\n".join(extractive_passages)
            )
        return f"Hello! I am your {role_display} AI Assistant. How can I assist you with your department data today?"

    def generate(
        self,
        query: str,
        chunks: list[dict],
        role: UserRole,
        allowed_collections: list[str],
    ) -> str:
        """
        Generate answer using local LLaMA or Gemini based on retrieved chunks or conversational input.
        """
        role_str = role.value if hasattr(role, "value") else str(role)
        enum_role = None
        try:
            enum_role = UserRole(role_str)
        except ValueError:
            pass

        role_display = (
            ROLE_DISPLAY_NAMES.get(enum_role)
            if enum_role
            else ROLE_DISPLAY_NAMES.get(role_str, f"{role_str.title()} Team Member")
        )

        cleaned_q = query.strip().lower().rstrip("?!.")
        greetings = {"hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "greetings", "hi there", "hello there", "how are you", "who are you", "what can you do", "help"}
        is_greeting = cleaned_q in greetings or (len(cleaned_q.split()) <= 3 and any(g in cleaned_q for g in ["hello", "hi", "hey", "who are you", "how are you"]))

        if not chunks:
            if is_greeting:
                prompt = (
                    f"You are FinSolve AI, the intelligent internal knowledge assistant for FinSolve Technologies.\n"
                    f"Assisting Role: **{role_display}**\n\n"
                    f"The user said: '{query}'. Respond warmly, professionally, and concisely to greet them as {role_display} and state that you are ready to help answer questions about their department knowledge base."
                )
            else:
                prompt = (
                    f"You are FinSolve AI, the intelligent internal knowledge assistant for FinSolve Technologies.\n"
                    f"Assisting Role: **{role_display}**\n\n"
                    f"User Question: '{query}'\n\n"
                    f"INSTRUCTIONS: Respond directly and helpfully to the user's question using your general knowledge. "
                    f"If the question requests specific internal corporate data that is not in the knowledge base, answer concisely and gently note that specific internal document records were not found for this query."
                )
        else:
            context = self.build_context(chunks)
            role_desc = (
                ROLE_DESCRIPTIONS.get(enum_role)
                if enum_role
                else ROLE_DESCRIPTIONS.get(role_str, f"Access to {role_str} department documents.")
            )
            prompt = SYSTEM_PROMPT_TEMPLATE.format(
                role_display=role_display,
                role_description=role_desc,
                context=context,
            )

        # Route to Google Gemini IF valid key available, ELSE route to local LLaMA in Docker
        use_gemini = (self.preferred_provider == "gemini") and self.gemini_available

        if use_gemini:
            try:
                response = self._gemini_model.generate_content(
                    [prompt, f"\n\nUser Question: {query}"],
                    generation_config=genai.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=1500,
                    ),
                )
                return response.text
            except Exception as e:
                print(f"[RAG] Gemini generation error: {e}. Falling back to local LLaMA...")

        # Default / Fallback to local LLaMA in Docker
        return self._generate_via_ollama(prompt, query, chunks, role_display)

    def build_sources(self, chunks: list[dict]) -> list[SourceDocument]:
        """Convert filtered relevant chunks into source citations."""
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
        Full RAG pipeline: filter & retrieve relevant subset -> generate answer -> return relevant sources.
        """
        # Step 1: Retrieve only relevant chunks matching query & role
        chunks, allowed_collections = self.retrieve(user_query, role)

        # Step 2: Generate response from relevant chunks
        answer = self.generate(user_query, chunks, role, allowed_collections)

        # Step 3: Build source citations for relevant chunks
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
