from picamera2 import Picamera2
from picamera2.encoders.jpeg_encoder import JpegEncoder
import time
import asyncio
import base64
import websockets
import socket
import io
import numpy as np
from gpiozero import CPUTemperature
from time import time as getTime

cpu = CPUTemperature()

picam2 = Picamera2()

cameraConfig = picam2.create_preview_configuration(raw=picam2.sensor_modes[2])
picam2.configure(cameraConfig)

picam2.start()

FRAME_RATE = 10
THROTTLE_TEMP = 65

encoder = JpegEncoder()


def getVideoFrame():
    data = io.BytesIO()
    picam2.capture_file(data, format="jpeg")

    byteArray = data.getvalue()

    text = base64.b64encode(byteArray)

    return text


async def handleServer(websocket):
    print("Starting")

    lastTime = getTime()

    while True:
        # Throttling
        temperature = cpu.temperature

        if temperature > THROTTLE_TEMP:
            FRAME_RATE = 5
        else:
            FRAME_RATE = 10

        currTime = getTime()

        if currTime - lastTime > 1:
            print(temperature)

            lastTime = currTime

        data = getVideoFrame()

        if not data:
            return

        await websocket.send(data)

        time.sleep(1 / FRAME_RATE)


async def handle(websocket):
    await asyncio.create_task(handleServer(websocket))


async def wsClient(IP):
    server = await websockets.serve(handle, IP, 8082)

    async with server:
        await asyncio.Future()


s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))

IP = s.getsockname()[0]
s.close()

print(f"Current IP: {IP}")

asyncio.run(wsClient(IP))

picam2.release()
