from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_user
from app.db.database import users_collection, complaints_collection
from bson import ObjectId

router = APIRouter()


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):

    user_id = current_user["user_id"]

    user = await users_collection.find_one({
        "_id": ObjectId(user_id)
    })

    complaints = await complaints_collection.find({
        "user_id": user_id
    }).to_list(100)

    return {
        "name": user["name"],
        "phone": user.get("phone", ""),
        "tokens": user.get("tokens", 0),
        "profile_pic": user.get("profile_pic"),
        "my_complaints": complaints,
        "rewards": user.get("rewards", [])
    }


@router.patch("/profile")
async def update_profile(
    name: str = None,
    profile_pic: str = None,
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if name:
        update_data["name"] = name
    if profile_pic:
        update_data["profile_pic"] = profile_pic

    if not update_data:
        return {"message": "Nothing to update"}

    await users_collection.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": update_data}
    )

    return {"message": "Profile updated successfully"}


@router.get("/leaderboard")
async def leaderboard():
    users = await users_collection.find().sort("tokens", -1).limit(10).to_list(10)
    for user in users:
        user["_id"] = str(user["_id"])
    return users