from fastapi import APIRouter, Query, Depends
from app.schemas.complaint_schema import ComplaintCreate
from app.db.database import complaints_collection, upvotes_collection
from app.utils.dependencies import get_current_user
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import UploadFile, File, Depends
import cloudinary.uploader
from datetime import datetime, timezone

router = APIRouter()


# 🔥 1. CREATE COMPLAINT (JWT protected)
@router.post("/complaint")
async def create_complaint(
    title: str,
    description: str,
    pincode: str,
    location: str = None,
    image: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):

    now = datetime.now(timezone.utc)

    image_url = None

    if image:
        upload_result = cloudinary.uploader.upload(image.file)
        image_url = upload_result["secure_url"]

    complaint_dict = {
        "title": title,
        "description": description,
        "pincode": pincode,
        "location": location,
        "image_url": image_url,
        "status": "pending",
        "created_at": now,
        "upvotes": 0,
        "user_id": current_user["user_id"],
        "logs": [
            {
                "status": "pending",
                "time": now
            }
        ]
    }

    result = await complaints_collection.insert_one(complaint_dict)

    return {
        "message": "Complaint created successfully",
        "complaint_id": str(result.inserted_id),
        "image_url": image_url
    }


# 🔥 3. TOGGLE UPVOTE (JWT protected)
@router.post("/complaint/{complaint_id}/upvote")
async def toggle_upvote(
    complaint_id: str,
    current_user: dict = Depends(get_current_user)
):

    user_id = current_user["user_id"]

    existing = await upvotes_collection.find_one({
        "user_id": user_id,
        "complaint_id": complaint_id
    })

    if existing:
        # 🔻 remove upvote
        await upvotes_collection.delete_one({"_id": existing["_id"]})

        await complaints_collection.update_one(
            {"_id": ObjectId(complaint_id)},
            {"$inc": {"upvotes": -1}}
        )

        return {"message": "Upvote removed"}

    else:
        # 🔺 add upvote
        await upvotes_collection.insert_one({
            "user_id": user_id,
            "complaint_id": complaint_id
        })

        await complaints_collection.update_one(
            {"_id": ObjectId(complaint_id)},
            {"$inc": {"upvotes": 1}}
        )

        return {"message": "Upvoted successfully"}