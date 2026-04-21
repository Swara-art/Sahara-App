import asyncio
import motor.motor_asyncio

async def seed():
    MONGO_URL = "mongodb+srv://apoorvmk457_db_user:44dgJdai6aNmOFDw@cep.gmasft4.mongodb.net/"
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    db = client.sahara_db
    
    vouchers = [
        {
            "_id": "amazon_500",
            "name": "Amazon Gift Card (₹500)",
            "description": "Redeemable on Amazon.in for millions of items.",
            "cost": 1500,
            "type": "shopping",
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
        },
        {
            "_id": "flipkart_500",
            "name": "Flipkart Voucher (₹500)",
            "description": "Unlock infinite possibilities on Flipkart.com.",
            "cost": 1500,
            "type": "shopping",
            "image_url": "https://upload.wikimedia.org/wikipedia/en/thumb/9/94/Flipkart_logo.svg/2560px-Flipkart_logo.svg.png"
        },
        {
            "_id": "starbucks_200",
            "name": "Starbucks Coffee",
            "description": "Enjoy a freshly brewed coffee on us.",
            "cost": 800,
            "type": "food",
            "image_url": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1024px-Starbucks_Corporation_Logo_2011.svg.png"
        }
    ]
    
    for v in vouchers:
        await db.vouchers.update_one(
            {"_id": v["_id"]},
            {"$set": v},
            upsert=True
        )
    
    print("Vouchers seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
