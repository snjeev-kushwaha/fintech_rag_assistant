"""
Central API Router combining all sub-routers.
"""

from fastapi import APIRouter

from backend.app.api.system import router as system_router
from backend.app.api.auth import router as auth_router
from backend.app.api.chat import router as chat_router
from backend.app.api.departments import router as departments_router
from backend.app.api.users import router as users_router

api_router = APIRouter()

api_router.include_router(system_router)
api_router.include_router(auth_router)
api_router.include_router(chat_router)
api_router.include_router(departments_router)
api_router.include_router(users_router)
