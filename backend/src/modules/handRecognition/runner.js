import { spawn } from 'child_process';
import WebSocket from 'ws';
import { createWebsocketURL } from '../utils/websockets.js';
import { getConfig } from '../config/index.js';
import colors from 'colors/safe.js';
import kill from 'tree-kill';
import { v4 as uuid } from 'uuid';

const config = getConfig();
const RECOGNIZER_PORT = config.network.recognizer.port;
const RECONNECT_DELAY = config.reconnect_delay;

export class HandRecognition {
	constructor() {
		this.tasks = {};
	}

	addRecognizeTask = (image, callback) => {
		const taskId = uuid();
		this.tasks[taskId] = callback;

		this.wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(
					JSON.stringify({
						taskId,
						image,
					})
				);
			}
		});
	};

	handleMessage = (message) => {
		if (message !== 'Connected') {
			const data = JSON.parse(message);
			this.tasks[data.taskId](data.value === 'Hands');
			delete this.tasks[data.taskId];
		}
	};

	handleConnection = (ws) => {
		console.log(colors.green('Recognize client connected'));
		ws.on('message', this.handleMessage);
	};

	initWebsocket = () => {
		try {
			this.wss = new WebSocket.Server({ port: RECOGNIZER_PORT });

			console.log(colors.green('Started recognizer websocket'));

			this.wss.on('connection', this.handleConnection);
		} catch (err) {
			console.log(
				colors.red('Failed to connect to recognizer websocket')
			);
			console.log(colors.red(err));

			setTimeout(() => {
				this.initWebsocket();
			}, RECONNECT_DELAY);
		}
	};

	killProcess = () => {
		if (this.pythonProcess) {
			const pid = this.pythonProcess.pid;

			console.log(colors.blue(`Killing process: ${pid}`));

			this.pythonProcess.stdin.pause();
			kill(pid);
		}
	};

	initPython = () => {
		try {
			process.on('SIGINT', () => {
				this.killProcess();
			});

			this.pythonProcess = spawn('python', [
				'-u',
				'src/modules/handRecognition/handRecognition.py',
			]);

			this.pythonProcess.stdout.on('data', (data) => {
				console.log(data.toString());
			});

			this.pythonProcess.stderr.on('data', (data) => {
				console.error(colors.red(data.toString()));
			});

			this.pythonProcess.on('close', () => {
				console.log(colors.yellow('Python process closed'));
				this.initPython();
			});

			console.log(colors.green('Started python process'));
		} catch (err) {
			console.log('Error starting python');
			console.log(colors.red(err));

			this.killProcess();
			this.initPython();
		}
	};
}
