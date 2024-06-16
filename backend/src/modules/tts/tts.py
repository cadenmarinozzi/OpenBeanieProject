from dotenv import load_dotenv
from ibm_watson import TextToSpeechV1
from ibm_watson.websocket import SynthesizeCallback
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import os, pyaudio
from time import time
import sys

load_dotenv()

WATSON_API_KEY = os.getenv("WATSON_API_KEY")
SERVICE_URL = os.getenv("WATSON_SERVICE_URL")

CHANNELS = 1
RATE = 22050  # WAV Audio rate
FORMAT = pyaudio.paInt16

authenticator = IAMAuthenticator(WATSON_API_KEY)
service = TextToSpeechV1(authenticator=authenticator)
service.set_service_url(SERVICE_URL)

text = sys.argv[1]
print(text)


def formatForTTS(text):
    text = text.replace("\n", " ")
    text = text.replace("\t", " ")
    text = text.replace("\r", " ")
    text = text.replace("\\", "")
    text = text.replace("<", "")
    text = text.replace(">", "")
    text = text.replace('"', " ")
    text = text.replace("'", " ")

    return text


class TTSSynthesizeCallback(SynthesizeCallback):
    def __init__(self):
        SynthesizeCallback.__init__(self)

    def on_error(self, error):
        print("Error received: {}".format(error))

    def on_audio_stream(self, audioStream):
        # print(audioStream)
        if self.firstChunk:
            self.firstChunk = False

            return

        self.stream.write(audioStream)

    def on_close(self):
        print("closed")

    def createStream(self):
        self.firstChunk = True

        self.audioHandler = pyaudio.PyAudio()
        self.stream = self.audioHandler.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=RATE,
            output=True,
        )

    def closeAudioHandler(self):
        self.audioHandler.terminate()


synthesizeCallback = TTSSynthesizeCallback()
synthesizeCallback.createStream()

service.synthesize_using_websocket(
    text, synthesizeCallback, accept="audio/wav", voice="en-GB_JamesV3Voice"
)

synthesizeCallback.closeAudioHandler()

print("done")
