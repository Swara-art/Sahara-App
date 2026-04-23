import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient('mongodb+srv://apoorvmk457_db_user:44dgJdai6aNmOFDw@cep.gmasft4.mongodb.net/')
    db = client['sahara_db']
    await db['vouchers'].delete_many({})
    await db['vouchers'].insert_many([
        {
            "name": "Amazon Voucher",
            "description": "₹100 Off on Amazon",
            "cost": 10000
        },
        {
            "name": "Flipkart Voucher",
            "description": "₹100 Off on Flipkart",
            "cost": 10000
        }
    ])
    print('Vouchers seeded')

if __name__ == '__main__':
    asyncio.run(main())
