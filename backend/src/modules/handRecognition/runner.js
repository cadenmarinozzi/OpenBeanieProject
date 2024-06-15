import { spawn } from 'child_process';
import WebSocket from 'ws';
import { createWebsocketURL } from '../utils/websockets.js';
import { getConfig } from '../config/index.js';
import colors from 'colors/safe.js';
import kill from 'tree-kill';
import { v4 as uuid } from 'uuid';

const config = getConfig();
const RECOGNIZER_PORT = config.network.recognizer.port;

export class HandRecognition {
	constructor() {
		this.tasks = {};
	}

	addRecognizeTask = (image, callback) => {
		const taskId = uuid();

		this.ws.send(
			JSON.stringify({
				taskId,
				image,
			})
		);

		this.tasks[taskId] = callback;
	};

	handleMessage = (message) => {
		const data = JSON.parse(message);
		this.tasks[data.taskId].callback(data.value === 'Hands');
		delete this.tasks[data.taskId];
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

				this.ws.on('message', this.handleMessage);
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
				process.on('SIGINT', () => {
					this.killProcess();

					process.exit();
				});

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

					console.log(data.toString());
				});

				this.pythonProcess.stderr.on('data', (err) => {
					if (err.toString().includes('Started')) {
						console.log(
							colors.green('Python process websocket open')
						);
						resolve();
					}

					console.log(err.toString());
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
