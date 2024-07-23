import json
from channels.generic.websocket import AsyncWebsocketConsumer

class MemoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        print("Message received: ", message)

        # Split the message into parts (for demonstration purposes)
        parts = message.split()

        for part in parts:
            print("Sending part: ", part)
            await self.send(text_data=json.dumps({
                'message': part
            }))
