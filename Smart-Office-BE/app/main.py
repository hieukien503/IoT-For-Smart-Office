from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mqtt import FastMQTT, MQTTConfig
from .ws_connector import ws_connector
from .enums import Feeds, Home, WsEvent
from .utils import convert_utc_timestamp
from .models import FloatRecord, IntRecord
from .db_connector import db
from bson import ObjectId
import json
from dotenv import load_dotenv
import os
import pymongo

load_dotenv('app\.env')

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_DEVICE = Home.Humid.value

mqtt_config = MQTTConfig(
    host = os.getenv('MQTT_HOST'),
    port = int(os.getenv('MQTT_PORT')),
    keepalive = 60,
    username=os.getenv('AIO_USERNAME'),
    password=os.getenv('AIO_KEY')
)

mqtt = FastMQTT(
    config=mqtt_config
)

mqtt.init_app(app)

@app.websocket("/io")
async def websocket_endpoint(websocket: WebSocket):
    global CURRENT_DEVICE
    
    await ws_connector.connect(websocket)
    if ws_connector.is_connected():
        try:
            while True:
                data = await websocket.receive_text()
                parse_data = json.loads(data)
                if parse_data.get("event") == WsEvent.DeviceChanged.value:
                    CURRENT_DEVICE = parse_data.get("data")
                    
                # await ws_connector.send_message(data)
        except WebSocketDisconnect:
            print("ws disconnected")


@app.get("/records/{device}")
async def get_records_by_device(device: str) -> list:
    if any(d.value == device for d in Home):
        return await db.get_collection(device).find().sort('created_at', pymongo.ASCENDING).to_list(100)

@app.get("/led/status")
async def get_last_led_status():
    return await db.get_collection(Home.Led.value).find().sort('created_at', pymongo.DESCENDING).limit(1).to_list(1)  

@mqtt.on_connect()
def connect(client, flags, rc, properties):
    mqtt.client.subscribe(f"{Feeds.Humid.value}/json")
    mqtt.client.subscribe(f"{Feeds.Led.value}/json")
    mqtt.client.subscribe(f"{Feeds.Lumos.value}/json")
    mqtt.client.subscribe(f"{Feeds.Moved.value}/json")
    mqtt.client.subscribe(f"{Feeds.Temp.value}/json")
    print("Connected: ", client, flags, rc, properties)


@mqtt.on_message()
async def message(client, topic, payload, qos, properties):
    global CURRENT_DEVICE
    
    payload = json.loads(payload.decode())
    created_at = convert_utc_timestamp(payload.get("data", {"created_at": ""}).get("created_at"))
    
    record = None
    if topic in [f"{Feeds.Humid.value}/json", f"{Feeds.Temp.value}/json"]:
        record = FloatRecord(
            id = str(ObjectId()),
            created_at = created_at,
            value = float(payload.get("data").get("value", "")),
        )
    elif topic in [f"{Feeds.Led.value}/json", f"{Feeds.Lumos.value}/json", f"{Feeds.Moved.value}/json"]:
        record = IntRecord(
            id = str(ObjectId()),
            created_at = created_at,
            value = int(payload.get("data").get("value", "")),
        )
    
    device = ''
    if topic == f"{Feeds.Humid.value}/json":
        device = Home.Humid.value
    elif topic == f"{Feeds.Led.value}/json":
        device = Home.Led.value
    elif topic == f"{Feeds.Lumos.value}/json":
        device = Home.Lumos.value
    elif topic == f"{Feeds.Moved.value}/json":
        device = Home.Moved.value
    elif topic == f"{Feeds.Temp.value}/json":
        device = Home.Temp.value
    
    new_record = await db.get_collection(device).insert_one(
        record.model_dump(by_alias=True)
    )
    
    record_info = await db.get_collection(device).find_one({
        "_id": new_record.inserted_id
    })
    # Only send event if stay on same CURRENT_DEVICE
    if device == CURRENT_DEVICE:
        msg = {
            "event": WsEvent.IncomingValue,
            "device": device,
            "data": record_info
        }
    
        if record_info and ws_connector.is_connected():
            await ws_connector.send_message(json.dumps(msg))
        
    print("Received message: ", topic, payload)
    
@app.get("/led/publishMQTT/{value}")
async def publish_to_mqtt(value: str):
    mqtt.publish(Feeds.Led.value, value)
    return {"status": value == "1"}


@mqtt.on_disconnect()
def disconnect(client, packet, exc=None):
    print("Disconnected")


@mqtt.on_subscribe()
def subscribe(client, mid, qos, properties):
    print("subscribed", client, mid, qos, properties)
    
    