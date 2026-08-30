"""
System endpoints: health checks and status.
"""

from fastapi import APIRouter
from backend.app.models.schemas import HealthResponse
from backend.app.db.vector_store import list_collections

router = APIRouter(tags=["System"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and list loaded vector store collections."""
    collections = list_collections()
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        collections_loaded=collections,
    )
