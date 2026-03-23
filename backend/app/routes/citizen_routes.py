from fastapi import APIRouter, Query
from app.schemas.complaint_schema import ComplaintCreate
from app.db.database import complaints_collection, upvotes_collection
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter()


# 🔥 1. CREATE COMPLAINT
@router.post("/complaint")
async def create_complaint(complaint: ComplaintCreate):
    
    complaint_dict = complaint.model_dump()

    now = datetime.now(timezone.utc)

    complaint_dict["status"] = "pending"
    complaint_dict["created_at"] = now
    complaint_dict["upvotes"] = 0

    # logs (timeline system)
    complaint_dict["logs"] = [
        {
            "status": "pending",
            "time": now
        }
    ]

    # temporary user (will replace later with auth)
    complaint_dict["user_id"] = "demo_user"

    result = await complaints_collection.insert_one(complaint_dict)

    return {
        "message": "Complaint created successfully",
        "complaint_id": str(result.inserted_id)
    }


# 🔥 2. GET COMPLAINTS (with filter + sort)
@router.get("/complaints")
async def get_all_complaints(
    pincode: str = Query(None),
    status: str = Query(None),
    sort_by: str = Query(None)
):

    filter_query = {}

    if pincode:
        filter_query["pincode"] = pincode

    if status:
        filter_query["status"] = status

    # sorting logic
    if sort_by == "latest":
        cursor = complaints_collection.find(filter_query).sort("created_at", -1)

    elif sort_by == "upvotes":
        cursor = complaints_collection.find(filter_query).sort("upvotes", -1)

    else:
        cursor = complaints_collection.find(filter_query)

    complaints = []

    async for complaint in cursor:
        complaint["_id"] = str(complaint["_id"])
        complaints.append(complaint)

    return complaints


# 🔥 3. TOGGLE UPVOTE
@router.post("/complaint/{complaint_id}/upvote")
async def toggle_upvote(complaint_id: str):

    user_id = "demo_user"  # temporary

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