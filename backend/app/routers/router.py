from fastapi import APIRouter
from app.routers import users, auth, schools, advisors, guides,admin,tours,fairs,guides_tour,notifications,individual_tours,puantaj,guides_fair # each for one table of the database

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(schools.router, prefix="/schools", tags=["schools"])
api_router.include_router(advisors.router, prefix="/advisors", tags=["advisors"])
api_router.include_router(guides.router, prefix="/guides", tags=["guides"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(tours.router, prefix="/tours", tags=["tours"])
api_router.include_router(fairs.router, prefix="/fairs", tags=["fairs"])
api_router.include_router(guides_tour.router, prefix="/guides_tour", tags=["guides_tour"])
api_router.include_router(individual_tours.router, prefix="/individual_tours", tags=["individual_tours"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(puantaj.router, prefix="/puantaj", tags=["puantaj"])
api_router.include_router(guides_fair.router, prefix="/guides_fair", tags=["guides_fair"])


