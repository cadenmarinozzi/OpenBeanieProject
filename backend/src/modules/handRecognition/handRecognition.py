import cv2
import mediapipe as mp
import asyncio
import websockets
import json
import sys

mpHands = mp.solutions.hands
hands = mpHands.Hands()


async def handleServer(websocket):
    async for jsonData in websocket:  # base64 image
        data = json.loads(jsonData)

        taskId = data["taskId"]
        imageData = data["image"]

        image = cv2.imread(imageData)
        frameRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(frameRGB)

        print("aaa")

        await websocket.send(
            json.dumps(
                {
                    "taskId": taskId,
                    "value": results.multi_hand_landmarks and "Hands" or "No hands",
                }
            )
        )


async def handle(websocket):
    await asyncio.create_task(handleServer(websocket))


async def wsClient(IP):
    print("Started")
    server = await websockets.serve(handle, IP, 8082)

    try:
        async with server:
            await asyncio.Future()
    except KeyboardInterrupt:
        server.close()
        sys.exit()


asyncio.run(wsClient("127.0.0.1"))
