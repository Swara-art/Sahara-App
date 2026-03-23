from fastapi import APIRouter
from app.db.database import complaints_collection
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()


# 🔍 1. Get all pending complaints
@router.get("/admin/pending")
async def get_pending_complaints():

    complaints = []

    cursor = complaints_collection.find({"status": "pending"})

    async for complaint in cursor:
        complaint["_id"] = str(complaint["_id"])
        complaints.append(complaint)

    return complaints


# ✅ 2. Approve complaint
@router.post("/admin/{complaint_id}/approve")
async def approve_complaint(complaint_id: str):

    now = datetime.now(timezone.utc)

    await complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {
            "$set": {"status": "approved"},
            "$push": {
                "logs": {
                    "status": "approved",
                    "time": now,
                    "by": "admin_demo"
                }
            }
        }
    )

    return {"message": "Complaint approved"}


# ❌ 3. Reject complaint
@router.post("/admin/{complaint_id}/reject")
async def reject_complaint(complaint_id: str, reason: str):

    now = datetime.now(timezone.utc)

    await complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {
            "$set": {
                "status": "rejected",
                "rejection_reason": reason
            },
            "$push": {
                "logs": {
                    "status": "rejected",
                    "time": now,
                    "by": "admin_demo",
                    "reason": reason
                }
            }
        }
    )

    return {"message": "Complaint rejected"}