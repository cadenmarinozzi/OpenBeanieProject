from picamera2 import Picamera2
from picamera2.encoders.jpeg_encoder import JpegEncoder
import time
import asyncio
import base64
import websockets
import socket
import io

picam2 = Picamera2()
picam2.start()

FRAME_RATE = 30

encoder = JpegEncoder()


def getVideoFrame(cap):
    data = io.BytesIO()
    picam2.capture_file(data, format="jpeg")

    jpg_as_text = base64.b64encode(data.getvalue())

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


cap = picam2

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))

# or socket.gethostbyname(socket.gethostname())
IP = s.getsockname()[0]
s.close()

print(IP)

asyncio.run(wsClient(cap, IP))

cap.release()
picam2.release()
