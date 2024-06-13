import WebSocket from 'ws';
import fs from 'fs';
import { exec } from 'child_process';
import { getConfig } from '../config/index.js';
import { createWebsocketURL } from '../utils/websockets.js';
import { createGestureMessages, createMessages } from '../utils/completions.js';
import { generateVisionCompletion } from '../openai/index.js';
import { gesturePrompts } from '../actions/index.js';
import { imageDataToBase64 } from '../utils/images.js';
import colors from 'colors/safe.js';
import { runTTS } from '../tts/runner.js';

const config = getConfig();

const PI_IP = config.network.pi.ip;
const PI_PORT = config.network.pi.port;
const PROCESS_RATE = config.process_rate;
const STREAM_TTS = config.tts.stream;
const PERSISTENT_HISTORY = config.history.persistent;
const HISTORY_PERSIST_FILE = config.history.persist_file;

export default class ServerWebSocket {
	constructor(viewer) {
		this.lastDataTime = 0;
		this.history = {};
		this.ws = new WebSocket(createWebsocketURL(PI_IP, PI_PORT));
		this.viewer = viewer;
	}

	addToHistory = (completion) => {
		this.history[new Date().toLocaleString()] = {
			completion,
			image: this.image,
		};

		if (PERSISTENT_HISTORY) {
			fs.writeFileSync(
				HISTORY_PERSIST_FILE,
				JSON.stringify(this.history)
			);
		}
	};

	shouldProcess = (currentTime) => {
		const deltaTime = currentTime - this.lastDataTime;

		return deltaTime >= 1000 / PROCESS_RATE;
	};

	doTTS = async (completion) => {
		if (STREAM_TTS) {
			return runTTS(completion);
		}

		await generateTTSAudio(completion);
		exec('afplay temp/audio.wav');
	};

	handleOpen = () => {
		console.log(colors.green('Server WebSocket connected'));
	};

	getGestureState = async () => {
		const gestureMessages = createGestureMessages(this.image);
		const gestureState = await generateVisionCompletion(
			gestureMessages,
			50
		);

		return gestureState;
	};

	getCompletion = async (prompt) => {
		const messages = createMessages(this.history, this.image, prompt);
		const completion = await generateVisionCompletion(messages);

		return completion;
	};

	handleMessage = async (data) => {
		try {
			const imageData = data.toString();

			this.image = imageDataToBase64(imageData);
			this.viewer.sendImage(this.image);

			const currentTime = new Date().getTime();

			if (!this.shouldProcess(currentTime)) {
				return;
			}

			console.log(colors.blue('Processing...'));

			this.lastDataTime = currentTime;

			const gestureState = await this.getGestureState();
			console.log(colors.yellow(`Gesture State: ${gestureState}`));

			const prompt = gesturePrompts[gestureState];

			if (!prompt) {
				return;
			}

			const completion = await this.getCompletion(prompt);
			console.log(colors.yellow(`Completion: ${completion}`));

			this.addToHistory(completion);
			this.doTTS(completion);
		} catch (e) {
			console.error(e);
		}
	};

	init() {
		this.ws.on('open', this.handleOpen);
		this.ws.on('message', this.handleMessage);

		console.log(
			colors.green(
				'Server WebSocket started on ' +
					createWebsocketURL(PI_IP, PI_PORT)
			)
		);
	}
}
