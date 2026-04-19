from fastapi import FastAPI
from app.routes.citizen_routes import router as citizen_router
from app.routes.admin_routes import router as admin_router
from app.routes.mediator_routes import router as mediator_router
from app.routes.authority_routes import router as authority_router
from app.routes.user_routes import router as user_router
# from app.routes.volunteer_routes import router as volunteer_router
import app.utils.cloudinary_config
from fastapi.middleware.cors import CORSMiddleware
from app.routes import profile_routes, voucher_routes

app = FastAPI()

app.include_router(citizen_router)
app.include_router(admin_router)
app.include_router(mediator_router)
app.include_router(authority_router)
app.include_router(user_router)
app.include_router(profile_routes.router)
app.include_router(voucher_routes.router)
# app.include_router(volunteer_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend running with DB 🚀"}