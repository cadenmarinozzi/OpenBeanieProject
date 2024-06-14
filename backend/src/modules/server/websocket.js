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
import { HandRecognition } from '../handRecognition/runner.js';
const config = getConfig();

const PI_IP = config.network.pi.ip;
const PI_PORT = config.network.pi.port;
const PROCESS_RATE = config.process_rate;
const STREAM_TTS = config.tts.stream;
const PERSISTENT_HISTORY = config.history.persistent;
const HISTORY_PERSIST_FILE = config.history.persist_file;
const RECONNECT_DELAY = config.reconnect_delay;

export default class ServerWebSocket {
	constructor(viewer, handRecognizer) {
		this.lastDataTime = 0;
		this.history = {};
		this.viewer = viewer;
		this.handRecognizer = handRecognizer;
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

	handleClose = () => {
		console.log(colors.red('Server WebSocket disconnected'));
		this.ws.terminate();
	};

	handleError = () => {
		console.log(colors.red('Server WebSocket errored'));
		this.ws.terminate();

		setTimeout(() => {
			this.init();
		}, RECONNECT_DELAY);
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
			// const imageData = await rotate90(data.toString());
			const imageData = data.toString();
			this.image = imageDataToBase64(imageData);
			this.viewer.sendData('image', this.image);

			const currentTime = new Date().getTime();

			if (this.needsStatusSent) {
				this.viewer.sendData('status', 'Waiting');
				this.needsStatusSent = false;
			}

			if (!this.shouldProcess(currentTime)) {
				return;
			}

			this.viewer.sendData('status', 'Processing');

			console.log(colors.blue('Processing...'));

			this.lastDataTime = currentTime;

			this.viewer.sendData('status', 'Getting gesture state');

			const handInFrame = await this.handRecognizer.addRecognizeTask(
				imageData
			);

			if (!handInFrame) {
				return;
			}

			const gestureState = await this.getGestureState();
			console.log(colors.yellow(`Gesture State: ${gestureState}`));
			this.viewer.sendData('gestureState', gestureState);

			const prompt = gesturePrompts[gestureState];

			if (!prompt) {
				return;
			}

			this.viewer.sendData('prompt', prompt);

			this.viewer.sendData('status', 'Generating completion');

			const completion = await this.getCompletion(prompt);
			this.viewer.sendData('completion', completion);
			console.log(colors.yellow(`Completion: ${completion}`));

			this.addToHistory(completion);

			this.viewer.sendData('status', 'Speaking');
			this.doTTS(completion);

			this.needsStatusSent = true;
		} catch (err) {
			console.error(colors.red(err));
		}
	};

	init = async () => {
		try {
			this.ws = new WebSocket(createWebsocketURL(PI_IP, PI_PORT));

			this.ws.on('open', this.handleOpen);
			this.ws.on('message', this.handleMessage);
			this.ws.on('close', this.handleClose);
			this.ws.on('error', this.handleError);

			console.log(
				colors.green(
					'Server WebSocket started on ' +
						createWebsocketURL(PI_IP, PI_PORT)
				)
			);
		} catch (err) {
			console.log(colors.red('Server WebSocket failed to start'));
			console.log(colors.red(err));

			this.handRecognizer.killProcess();

			setTimeout(() => {
				this.init();
			}, RECONNECT_DELAY);
		}
	};
}
