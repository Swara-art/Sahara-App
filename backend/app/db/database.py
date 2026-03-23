from motor.motor_asyncio import AsyncIOMotorClient
import os


MONGO_URL = "mongodb+srv://apoorvmk457_db_user:44dgJdai6aNmOFDw@cep.gmasft4.mongodb.net/"

client = AsyncIOMotorClient(MONGO_URL)

db = client["sahara_db"]  # database name

# Collections
users_collection = db["users"]
complaints_collection = db["complaints"]
logs_collection = db["logs"]
upvotes_collection = db["upvotes"]