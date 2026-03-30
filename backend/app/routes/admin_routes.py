from fastapi import APIRouter, Depends
from app.db.database import complaints_collection
from bson import ObjectId
from datetime import datetime, timezone
from app.utils.dependencies import require_role

router = APIRouter()


# 🔍 View pending
@router.get("/admin/pending")
async def get_pending_complaints(
    current_user: dict = Depends(require_role("admin"))
):
    complaints = []

    cursor = complaints_collection.find({"status": "pending"})

    async for complaint in cursor:
        complaint["_id"] = str(complaint["_id"])
        complaints.append(complaint)

    return complaints


# ✅ Approve
@router.post("/admin/{complaint_id}/approve")
async def approve_complaint(
    complaint_id: str,
    current_user: dict = Depends(require_role("admin"))
):

    complaint = await complaints_collection.find_one({"_id": ObjectId(complaint_id)})

    if not complaint:
        return {"error": "Complaint not found"}

    if complaint["status"] != "pending":
        return {"error": "Only pending complaints can be approved"}

    now = datetime.now(timezone.utc)

    await complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {
            "$set": {"status": "approved"},
            "$push": {
                "logs": {
                    "status": "approved",
                    "time": now,
                    "by": current_user["user_id"]
                }
            }
        }
    )

    return {"message": "Complaint approved"}


# ❌ Reject
@router.post("/admin/{complaint_id}/reject")
async def reject_complaint(
    complaint_id: str,
    reason: str,
    current_user: dict = Depends(require_role("admin"))
):

    complaint = await complaints_collection.find_one({"_id": ObjectId(complaint_id)})

    if not complaint:
        return {"error": "Complaint not found"}

    if complaint["status"] != "pending":
        return {"error": "Only pending complaints can be rejected"}

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
                    "by": current_user["user_id"],
                    "reason": reason
                }
            }
        }
    )

    return {"message": "Complaint rejected"}