from fastapi import WebSocket

class WebsocketConnector:
    def __init__(self):
        self.custome_ws = None
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.custome_ws = websocket
    
    async def send_message(self, message: str):
        await self.custome_ws.send_text(message)
    
    async def receive_message(self) -> str:
        return await self.custome_ws.receive_text()
    
    def is_connected(self) -> bool:
        return self.custome_ws is not None
    
    
ws_connector = WebsocketConnector()