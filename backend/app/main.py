from fastapi import FastAPI
from app.routes.citizen_routes import router as citizen_router
from app.routes.admin_routes import router as admin_router
from app.routes.mediator_routes import router as mediator_router
from app.routes.authority_routes import router as authority_router
from app.routes.user_routes import router as user_router
import app.utils.cloudinary_config

app = FastAPI()

app.include_router(citizen_router)
app.include_router(admin_router)
app.include_router(mediator_router)
app.include_router(authority_router)
app.include_router(user_router)

@app.get("/")
async def root():
    return {"message": "Backend running with DB 🚀"}