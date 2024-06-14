import { spawn } from 'child_process';
import WebSocket from 'ws';
import { createWebsocketURL } from '../utils/websockets.js';
import { getConfig } from '../config/index.js';
import colors from 'colors/safe.js';
import kill from 'tree-kill';

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

	handleOpen = () => {
		console.log(colors.green('Python process websocket connected'));
	};

	initWebsocket = async () => {
		return new Promise((resolve) => {
			try {
				this.ws = new WebSocket(
					createWebsocketURL('127.0.0.1', RECOGNIZER_PORT)
				);

				console.log(colors.green('Started recognizer websocket'));

				this.ws.on('open', () => {
					this.handleOpen();
					resolve();
				});

				// this.ws.on('message', this.handleMessage);
			} catch (err) {
				console.log(
					colors.red('Failed to connect to recognizer websocket')
				);
				console.log(colors.red(err));

				setTimeout(() => {
					this.initWebsocket();
				}, 3000);
			}
		});
	};

	killProcess = () => {
		if (this.pythonProcess) {
			const pid = this.pythonProcess.pid;

			console.log(colors.blue(`Killing process: ${pid}`));

			this.pythonProcess.stdin.pause();
			kill(pid);
		}
	};

	initPython = async () => {
		return new Promise((resolve) => {
			try {
				process.on('SIGINT', this.killProcess);

				this.pythonProcess = spawn('python', [
					'src/modules/handRecognition/handRecognition.py',
				]);

				console.log(colors.green('Started python process'));

				this.pythonProcess.stdout.on('data', (data) => {
					if (data.toString().includes('Started')) {
						console.log(
							colors.green('Python process websocket open')
						);
						resolve();
					}
				});
			} catch (err) {
				console.log('Error starting python');
				console.log(colors.red(err));

				this.killProcess();
				this.initPython();
			}
		});
	};
}
