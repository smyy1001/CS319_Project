from fastapi import APIRouter
from app.routers import users, auth, schools, advisors, guides,admin # each for one table of the database

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(schools.router, prefix="/schools", tags=["schools"])
api_router.include_router(advisors.router, prefix="/advisors", tags=["advisors"])
api_router.include_router(guides.router, prefix="/guides", tags=["guides"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
