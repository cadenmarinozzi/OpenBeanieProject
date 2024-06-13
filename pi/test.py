import cv2
import time
import asyncio
import base64
import websockets
import socket

FRAME_RATE = 30


def getVideoFrame(cap):
    ret, frame = cap.read()

    if not ret:
        return

    data = cv2.imencode(".jpg", frame)[1]
    jpg_as_text = base64.b64encode(data)

    return jpg_as_text


async def handleServer(websocket):
    print("Starting")

    while True:
        data = getVideoFrame(cap)

        if not data:
            return

        await websocket.send(data)

        time.sleep(1 / FRAME_RATE)


async def handle(websocket):
    await asyncio.create_task(handleServer(websocket))


async def wsClient(cap, IP):
    server = await websockets.serve(handle, IP, 5000)

    async with server:
        await asyncio.Future()


cap = cv2.VideoCapture(1)

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))

# or socket.gethostbyname(socket.gethostname())
IP = s.getsockname()[0]
s.close()

print(IP)

asyncio.run(wsClient(cap, IP))

cap.release()
