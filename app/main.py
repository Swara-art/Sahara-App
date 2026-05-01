from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.citizen_routes import router as citizen_router
from routes.authority_routes import router as authority_router
from routes.user_routes import router as user_router
from routes import profile_routes, voucher_routes
import utils.cloudinary_config

app = FastAPI(title="Sahara AI Backend", description="AI-Driven Civic Complaint Management System")

# 🔥 CORS CONFIGURATION
origins = [
    "http://10.88.154.145:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 ROUTES
app.include_router(user_router, tags=["Authentication"])
app.include_router(citizen_router, tags=["Citizen Operations"])
app.include_router(authority_router, tags=["Authority Operations"])
app.include_router(profile_routes.router, tags=["User Profile"])
app.include_router(voucher_routes.router, tags=["Rewards & Vouchers"])

@app.get("/")
async def root():
    return {
        "message": "Sahara AI Backend is live 🚀",
        "roles": ["citizen", "authority"],
        "architecture": "AI-Driven Validation & Routing"
    }