"""
FinSolve Technologies — RAG RBAC Chatbot
Vector Store — ChromaDB Setup, Embeddings & Document Ingestion
"""

import os
import uuid
from pathlib import Path
from typing import Optional

import chromadb
from sentence_transformers import SentenceTransformer

from backend.app.core.config import settings, CHROMA_DIR, DATA_DIR

COLLECTION_NAME_MAP: dict[str, str] = {
    "hr": "hr_data",
}


def _to_collection_name(dir_name: str) -> str:
    """Convert a data directory name to a valid ChromaDB collection name."""
    return COLLECTION_NAME_MAP.get(dir_name, dir_name)


# ── Embedding Model (runs locally, no API key needed) ────────────────────────
_embedding_model: Optional[SentenceTransformer] = None


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        print(f"[VectorStore] Loading embedding model: {settings.embedding_model}")
        _embedding_model = SentenceTransformer(settings.embedding_model)
    return _embedding_model


# ── Custom Embedding Function for ChromaDB ────────────────────────────────────

class SentenceTransformerEmbedding:
    """Custom embedding function compatible with ChromaDB's EmbeddingFunction interface."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def __call__(self, input: list[str]) -> list[list[float]]:
        embeddings = self.model.encode(input, show_progress_bar=False)
        return embeddings.tolist()


# ── ChromaDB Client ───────────────────────────────────────────────────────────
_chroma_client: Optional[chromadb.PersistentClient] = None
_embedding_fn: Optional[SentenceTransformerEmbedding] = None


def get_chroma_client() -> chromadb.PersistentClient:
    global _chroma_client
    if _chroma_client is None:
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        print(f"[VectorStore] Connecting to ChromaDB at: {CHROMA_DIR}")
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    return _chroma_client


def get_embedding_fn() -> SentenceTransformerEmbedding:
    global _embedding_fn
    if _embedding_fn is None:
        _embedding_fn = SentenceTransformerEmbedding(settings.embedding_model)
    return _embedding_fn


def get_collection(collection_name: str) -> chromadb.Collection:
    """Get or create a ChromaDB collection for a department."""
    client = get_chroma_client()
    embedding_fn = get_embedding_fn()
    safe_name = _to_collection_name(collection_name)
    return client.get_or_create_collection(
        name=safe_name,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )


def list_collections() -> list[str]:
    """Return all collection names in the ChromaDB store."""
    client = get_chroma_client()
    return [col.name for col in client.list_collections()]


# ── Document Chunking ─────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> list[str]:
    """
    Split text into overlapping chunks by character count.
    Uses word boundaries to avoid cutting mid-word.
    """
    chunk_size = chunk_size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap

    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0

    for word in words:
        word_len = len(word) + 1  # +1 for space
        if current_length + word_len > chunk_size and current_chunk:
            chunks.append(" ".join(current_chunk))
            overlap_words = current_chunk[-max(1, overlap // 6):]
            current_chunk = overlap_words + [word]
            current_length = sum(len(w) + 1 for w in current_chunk)
        else:
            current_chunk.append(word)
            current_length += word_len

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


# ── Data Ingestion ────────────────────────────────────────────────────────────

def ingest_directory(data_dir: Path = None) -> dict[str, int]:
    """
    Walk the data directory and ingest all .txt files into ChromaDB.
    Directory structure: data/<department>/<filename>.txt
    Returns a dict of {collection_name: document_count}.
    """
    data_dir = data_dir or DATA_DIR
    results = {}

    print(f"\n[VectorStore] Starting data ingestion from: {data_dir}")

    for dept_dir in sorted(data_dir.iterdir()):
        if not dept_dir.is_dir():
            continue

        collection_name = _to_collection_name(dept_dir.name)
        collection = get_collection(collection_name)

        existing_count = collection.count()
        if existing_count > 0:
            print(f"  [{collection_name}] Already has {existing_count} chunks — skipping.")
            results[collection_name] = existing_count
            continue

        total_chunks = 0
        for txt_file in sorted(dept_dir.glob("*.txt")):
            print(f"  [{collection_name}] Ingesting: {txt_file.name}")
            text = txt_file.read_text(encoding="utf-8")
            chunks = chunk_text(text)

            ids = [str(uuid.uuid4()) for _ in chunks]
            metadatas = [
                {
                    "source_file": txt_file.name,
                    "department": collection_name,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                }
                for i, _ in enumerate(chunks)
            ]

            batch_size = 50
            for i in range(0, len(chunks), batch_size):
                batch_ids = ids[i : i + batch_size]
                batch_docs = chunks[i : i + batch_size]
                batch_meta = metadatas[i : i + batch_size]
                collection.add(ids=batch_ids, documents=batch_docs, metadatas=batch_meta)

            total_chunks += len(chunks)
            print(f"    → {len(chunks)} chunks ingested from {txt_file.name}")

        results[collection_name] = total_chunks
        print(f"  [{collection_name}] Total: {total_chunks} chunks\n")

    print("[VectorStore] Ingestion complete!")
    return results


def query_collections(
    query: str,
    collection_names: list[str],
    top_k: int = None,
    max_distance: float = None,
) -> list[dict]:
    """
    Query ChromaDB collections for relevant document chunks matching user query.
    Filters out results exceeding max_distance threshold to return ONLY relevant matching subset.
    """
    top_k = top_k or settings.retrieval_top_k
    max_dist = max_distance if max_distance is not None else getattr(settings, "max_distance_threshold", 0.65)
    all_results = []

    for cname in collection_names:
        try:
            collection = get_collection(cname)
            if collection.count() == 0:
                continue

            results = collection.query(
                query_texts=[query],
                n_results=min(top_k, collection.count()),
                include=["documents", "metadatas", "distances"],
            )

            docs = results["documents"][0]
            metas = results["metadatas"][0]
            dists = results["distances"][0]

            for doc, meta, dist in zip(docs, metas, dists):
                if dist <= max_dist:
                    all_results.append(
                        {
                            "content": doc,
                            "source_file": meta.get("source_file", "unknown"),
                            "department": meta.get("department", cname),
                            "distance": dist,
                            "collection": cname,
                        }
                    )
        except Exception as e:
            print(f"[VectorStore] Warning: Error querying '{cname}': {e}")
            continue

    all_results.sort(key=lambda x: x["distance"])
    return all_results[:top_k]


def ingest_single_file(file_path: Path, department: str) -> int:
    """
    Ingest a single document file into the department's ChromaDB vector collection.
    Returns the number of chunks ingested.
    """
    collection_name = _to_collection_name(department)
    collection = get_collection(collection_name)

    try:
        content = file_path.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        print(f"[VectorStore] Error reading file {file_path}: {e}")
        return 0

    if not content.strip():
        return 0

    chunks = chunk_text(content)
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [
        {
            "source_file": file_path.name,
            "department": collection_name,
            "chunk_index": i,
            "total_chunks": len(chunks),
        }
        for i, _ in enumerate(chunks)
    ]

    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        collection.add(
            ids=ids[i : i + batch_size],
            documents=chunks[i : i + batch_size],
            metadatas=metadatas[i : i + batch_size],
        )

    print(f"[VectorStore] Successfully ingested {len(chunks)} chunks from {file_path.name} into '{collection_name}' collection.")
    return len(chunks)
