from fastapi import APIRouter
from app.routers import users, auth # each for one table of the database

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
