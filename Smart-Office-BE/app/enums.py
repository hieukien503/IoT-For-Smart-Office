from enum import Enum
from dotenv import load_dotenv
import os

load_dotenv('app\.env')

class Home(str, Enum):
    Humid = f"{os.getenv('AIO_GROUP_ID')}.sh-humid"
    Led = f"{os.getenv('AIO_GROUP_ID')}.sh-led"
    Lumos = f"{os.getenv('AIO_GROUP_ID')}.sh-lumos"
    Moved = f"{os.getenv('AIO_GROUP_ID')}.sh-moved"
    Temp = f"{os.getenv('AIO_GROUP_ID')}.sh-temp"
    
class Feeds(str, Enum):
    Humid = f"{os.getenv('AIO_USERNAME')}/feeds/{Home.Humid.value}"
    Led = f"{os.getenv('AIO_USERNAME')}/feeds/{Home.Led.value}"
    Lumos = f"{os.getenv('AIO_USERNAME')}/feeds/{Home.Lumos.value}"
    Moved = f"{os.getenv('AIO_USERNAME')}/feeds/{Home.Moved.value}"
    Temp = f"{os.getenv('AIO_USERNAME')}/feeds/{Home.Temp.value}"
    
class WsEvent(str, Enum):
    IncomingValue = "incoming_value"
    DeviceChanged = "device_changed"
    