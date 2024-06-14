import { spawn } from 'child_process';
import WebSocket from 'ws';
import { createWebsocketURL } from '../utils/websockets.js';
import { getConfig } from '../config/index.js';
import colors from 'colors/safe.js';

const config = getConfig();
const RECOGNIZER_PORT = config.network.recognizer.port;

export class HandRecognition {
	constructor() {
		this.tasks = [];
	}

	addRecognizeTask = (image) => {
		this.ws.send(image);

		const task = new Promise((resolve, reject) => {
			this.ws.on('message', (message) => {
				if (message === 'Hands') {
					resolve(true);
				} else if (message === 'No hands') {
					resolve(false);
				}
			});
		});

		this.tasks.push(task);

		return task;
	};

	handleMessage = (message) => {
		// const handDetected = message === 'Hand detected';
		// if (handDetected) {
		// 	this.tasks[0].resolve(true);
		// }
	};

	initWebsocket = () => {
		try {
			this.ws = new WebSocket(
				createWebsocketURL('127.0.0.1', RECOGNIZER_PORT)
			);

			// this.ws.on('message', this.handleMessage);
		} catch (error) {
			console.log(
				colors.red('Failed to connect to recognizer websocket')
			);

			setTimeout(() => {
				this.initWebsocket();
			}, 3000);
		}
	};

	initPython = async () => {
		process.on('SIGINT', () => {
			this.pythonProcess.exit();
		});

		return new Promise((resolve, reject) => {
			this.pythonProcess = spawn('python', [
				'src/modules/handRecognition/handRecognition.py',
			]);

			this.pythonProcess.stdout.on('data', (data) => {
				if (data.toString().includes('Hand detected')) {
					resolve(true);
				} else {
					resolve(false);
				}
			});

			this.pythonProcess.stderr.on('data', (data) => {
				console.error(data.toString());
				reject();
			});
		});
	};
}
