from fastapi import APIRouter, Depends
from app.db.database import complaints_collection, users_collection, upvotes_collection
from bson import ObjectId
from datetime import datetime, timezone
from app.utils.dependencies import require_role

router = APIRouter()


# 🔍 View assigned
@router.get("/authority/assigned")
async def get_assigned_complaints(
    department: str,
    current_user: dict = Depends(require_role("authority"))
):

    complaints = []

    cursor = complaints_collection.find({
        "status": {"$in": ["assigned", "in_progress", "resolved"]},
        "assigned_to": department
    })

    async for complaint in cursor:
        complaint["_id"] = str(complaint["_id"])
        complaints.append(complaint)

    return complaints


# 🛠️ Start work
@router.post("/authority/{complaint_id}/start")
async def start_work(
    complaint_id: str,
    current_user: dict = Depends(require_role("authority"))
):

    complaint = await complaints_collection.find_one({"_id": ObjectId(complaint_id)})

    if not complaint:
        return {"error": "Complaint not found"}

    if complaint["status"] != "assigned":
        return {"error": "Only assigned complaints can be started"}

    now = datetime.now(timezone.utc)

    await complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {
            "$set": {"status": "in_progress"},
            "$push": {
                "logs": {
                    "status": "in_progress",
                    "time": now,
                    "by": current_user["user_id"]
                }
            }
        }
    )

    return {"message": "Work started"}


# ✅ Resolve
@router.post("/authority/{complaint_id}/resolve")
async def resolve_complaint(
    complaint_id: str,
    remark: str,
    current_user: dict = Depends(require_role("authority"))
):

    complaint = await complaints_collection.find_one({
        "_id": ObjectId(complaint_id)
    })

    if not complaint:
        return {"error": "Complaint not found"}

    if complaint["status"] != "in_progress":
        return {"error": "Only in-progress complaints can be resolved"}

    now = datetime.now(timezone.utc)

    # 🔥 update complaint
    await complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {
            "$set": {
                "status": "resolved",
                "resolution_remark": remark
            },
            "$push": {
                "logs": {
                    "status": "resolved",
                    "time": now,
                    "by": current_user["user_id"],
                    "remark": remark
                }
            }
        }
    )

    # 🔥 reward complaint owner
    await users_collection.update_one(
        {"_id": ObjectId(complaint["user_id"])},
        {"$inc": {"tokens": 300}}
    )

    # 🔥 reward upvoters (IMPORTANT FIX)
    upvoters = await upvotes_collection.find({
        "complaint_id": complaint_id
    }).to_list(100)

    for upvote in upvoters:
        await users_collection.update_one(
            {"_id": ObjectId(upvote["user_id"])},
            {"$inc": {"tokens": 10}}
        )

    return {"message": "Complaint resolved"}