"""
FinSolve Technologies - RAG RBAC Chatbot
Data Ingestion Script

Run this script ONCE before starting the chatbot to embed all
department documents into ChromaDB.

Usage:
    cd d:\\FinTech
    python scripts/ingest_data.py
"""

import sys
import io
import time
from pathlib import Path

# Force UTF-8 output on Windows to avoid cp1252 emoji issues
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.vector_store import ingest_directory, list_collections, get_chroma_client
from backend.config import DATA_DIR, CHROMA_DIR


def main():
    print("=" * 60)
    print("  FinSolve Technologies -- Data Ingestion Script")
    print("=" * 60)
    print(f"\n[DATA] Data directory:   {DATA_DIR}")
    print(f"[DB]   ChromaDB path:    {CHROMA_DIR}")
    print()

    # Check if data directory exists
    if not DATA_DIR.exists():
        print(f"[ERROR] Data directory not found: {DATA_DIR}")
        print("   Make sure you're running from the project root (d:\\FinTech)")
        sys.exit(1)

    # Check existing collections
    existing = list_collections()
    if existing:
        print(f"[WARN]  Found existing collections: {existing}")
        response = input("   Do you want to re-ingest? This will CLEAR existing data. (y/N): ")
        if response.strip().lower() == "y":
            print("\n[INFO]  Clearing existing collections...")
            client = get_chroma_client()
            for cname in existing:
                client.delete_collection(cname)
                print(f"   Deleted: {cname}")
            print()
        else:
            print("\n[INFO]  Keeping existing data. Skipping ingestion.")
            print_summary(existing)
            return

    # Run ingestion
    print("[INFO]  Starting document ingestion...\n")
    start_time = time.time()
    results = ingest_directory(DATA_DIR)
    elapsed = time.time() - start_time

    # Print summary
    print("\n" + "=" * 60)
    print("  [OK] Ingestion Complete!")
    print("=" * 60)
    print(f"\n  Time taken: {elapsed:.1f} seconds")
    print("\n  Collections Created:")
    print(f"  {'Collection':<20} {'Chunks':<10} Status")
    print(f"  {'-' * 20} {'-' * 10} ------")
    for cname, count in sorted(results.items()):
        status = "[OK]" if count > 0 else "[WARN] (empty)"
        print(f"  {cname:<20} {count:<10} {status}")

    total_chunks = sum(results.values())
    print(f"\n  Total chunks ingested: {total_chunks}")
    print(f"  Total collections:     {len(results)}")

    print("\n" + "=" * 60)
    print("  Ready! Start the chatbot with:")
    print()
    print("  1. Backend:   uvicorn backend.main:app --reload")
    print("  2. Frontend:  streamlit run frontend/app.py")
    print("=" * 60 + "\n")


def print_summary(collections: list[str]):
    from backend.vector_store import get_collection
    print("\n  Current Collections:")
    for cname in collections:
        col = get_collection(cname)
        print(f"  {cname:<20} {col.count()} chunks")


if __name__ == "__main__":
    main()
