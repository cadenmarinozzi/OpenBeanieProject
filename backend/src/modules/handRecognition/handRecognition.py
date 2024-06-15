import cv2
import mediapipe as mp
import json
import numpy as np
from async_websocket_client.apps import AsyncWebSocketApp
from async_websocket_client.dispatchers import BaseDispatcher
import base64

mpHands = mp.solutions.hands
hands = mpHands.Hands()

RECOGNIZER_PORT = 3500


class Handler(BaseDispatcher):
    async def on_connect(self):
        return await self.ws.send("Connected")

    async def on_message(self, message):
        data = json.loads(message)

        taskId = data["taskId"]
        imageData = data["image"]

        imageData = np.frombuffer(base64.b64decode(imageData), np.uint8)
        image = cv2.imdecode(imageData, cv2.IMREAD_COLOR)
        frameRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(frameRGB)

        return await self.ws.send(
            json.dumps(
                {
                    "taskId": taskId,
                    "value": results.multi_hand_landmarks and "Hands" or "No hands",
                }
            )
        )


client = AsyncWebSocketApp(f"ws://localhost:{RECOGNIZER_PORT}", Handler())
client.asyncio_run()
