from fastapi import APIRouter
from app.schemas.user_schema import UserSignup, UserLogin
from app.db.database import users_collection
from app.utils.hash import hash_password, verify_password
from app.utils.jwt_handler import create_access_token

router = APIRouter()


# 🔥 1. SIGNUP
@router.post("/signup")
async def signup(user: UserSignup):

    user_dict = user.model_dump()

    # 🔐 hash password
    user_dict["password"] = hash_password(user_dict["password"])

    # 🔥 ADD THESE (THIS IS STEP 1)
    user_dict["tokens"] = 0
    user_dict["profile_pic"] = ""
    user_dict["rewards"] = []

    result = await users_collection.insert_one(user_dict)
    
    # Generate token for automatic login
    token = create_access_token({
        "user_id": str(result.inserted_id),
        "role": user_dict["role"],
        "name": user_dict["name"],
        "department": user_dict.get("department")
    })

    return {
        "message": "User created successfully",
        "access_token": token,
        "token_type": "bearer"
    }

# 🔥 2. LOGIN (with JWT)
@router.post("/login")
async def login(user: UserLogin):

    # find user by email
    db_user = await users_collection.find_one({"email": user.email})

    if not db_user:
        return {"error": "User not found"}

    # verify password
    if not verify_password(user.password, db_user["password"]):
        return {"error": "Invalid password"}

    # 🔥 generate JWT token
    token = create_access_token({
        "user_id": str(db_user["_id"]),
        "role": db_user["role"],
        "name": db_user["name"],
        "department": db_user.get("department")
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer"
    }