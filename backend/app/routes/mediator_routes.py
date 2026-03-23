from fastapi import APIRouter
from app.db.database import complaints_collection
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()


# 🔍 1. Get approved complaints
@router.get("/mediator/approved")
async def get_approved_complaints():

    complaints = []

    cursor = complaints_collection.find({"status": "approved"})

    async for complaint in cursor:
        complaint["_id"] = str(complaint["_id"])
        complaints.append(complaint)

    return complaints


# 🧠 2. Assign category, priority, department
@router.post("/mediator/{complaint_id}/assign")
async def assign_complaint(
    complaint_id: str,
    category: str,
    priority: str,
    department: str
):

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
                    "by": "mediator_demo",
                    "category": category,
                    "priority": priority,
                    "department": department
                }
            }
        }
    )

    return {"message": "Complaint assigned successfully"}