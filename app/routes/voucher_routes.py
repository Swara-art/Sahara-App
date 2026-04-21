from fastapi import APIRouter, Depends
from utils.dependencies import get_current_user
from db.database import users_collection, vouchers_collection
from bson import ObjectId

router = APIRouter()


@router.get("/vouchers")
async def get_vouchers():
    vouchers = await vouchers_collection.find().to_list(10)

    for v in vouchers:
        v["_id"] = str(v["_id"])

    return vouchers


@router.post("/vouchers/buy/{voucher_id}")
async def buy_voucher(
    voucher_id: str,
    current_user: dict = Depends(get_current_user)
):

    user_id = current_user["user_id"]

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    voucher = await vouchers_collection.find_one({"_id": voucher_id})

    if user["tokens"] < voucher["cost"]:
        return {"error": "Not enough tokens"}

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"tokens": -voucher["cost"]}}
    )

    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {
            "rewards": {
                "voucher_id": voucher_id,
                "code": "RANDOMCODE123"
            }
        }}
    )

    return {"message": "Voucher purchased"}