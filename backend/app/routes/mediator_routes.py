from fastapi import APIRouter, Depends
from app.db.database import complaints_collection
from bson import ObjectId
from datetime import datetime, timezone
from app.utils.dependencies import require_role

router = APIRouter()


# 🔍 View approved
@router.get("/mediator/approved")
async def get_approved_complaints(
    current_user: dict = Depends(require_role("mediator"))
):

    complaints = []

    cursor = complaints_collection.find({"status": "approved"})

    async for complaint in cursor:
        complaint["_id"] = str(complaint["_id"])
        complaints.append(complaint)

    return complaints


# 🧠 Assign
@router.post("/mediator/{complaint_id}/assign")
async def assign_complaint(
    complaint_id: str,
    category: str,
    priority: str,
    department: str,
    current_user: dict = Depends(require_role("mediator"))
):

    complaint = await complaints_collection.find_one({"_id": ObjectId(complaint_id)})

    if not complaint:
        return {"error": "Complaint not found"}

    if complaint["status"] != "approved":
        return {"error": "Only approved complaints can be assigned"}

    now = datetime.now(timezone.utc)

    await complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {
            "$set": {
                "category": category,
                "priority": priority,
                "assigned_to": department,
                "status": "assigned"
            },
            "$push": {
                "logs": {
                    "status": "assigned",
                    "time": now,
                    "by": current_user["user_id"],
                    "category": category,
                    "priority": priority,
                    "department": department
                }
            }
        }
    )

    return {"message": "Complaint assigned successfully"}