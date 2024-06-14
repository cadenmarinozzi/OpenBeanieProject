import cv2
import mediapipe as mp
import asyncio
import websockets

mpHands = mp.solutions.hands
hands = mpHands.Hands()


async def handleServer(websocket):
    async for imageData in websocket:  # base64 image
        image = cv2.imread(imageData)
        frameRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(frameRGB)

        if results.multi_hand_landmarks:
            await websocket.send("Hands")
        else:
            await websocket.send("No hands")

        await websocket.send(hands)


async def handle(websocket):
    await asyncio.create_task(handleServer(websocket))


async def wsClient(IP):
    server = await websockets.serve(handle, IP, 8082)

    async with server:
        await asyncio.Future()


asyncio.run(wsClient("127.0.0.1"))