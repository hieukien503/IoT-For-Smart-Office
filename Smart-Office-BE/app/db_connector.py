import motor.motor_asyncio
import os
from .enums import Home

from dotenv import load_dotenv

load_dotenv('app\.env')

client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client.get_database("SmartOffice")