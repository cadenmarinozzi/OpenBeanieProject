import WebSocket from 'ws';
import { getConfig } from '../config/index.js';
import colors from 'colors/safe.js';

const config = getConfig();

const VIEWER_PORT = config.network.viewer.port;

export default class ViewerWebSocket {
	constructor() {
		this.wss = new WebSocket.Server({ port: VIEWER_PORT });
	}

	sendImage(image) {
		this.wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(image);
			}
		});
	}

	init() {
		this.wss.on('connection', (ws) => {
			console.log(colors.green('Viewer WebSocket client connected'));

			ws.on('close', () => {
				console.log(colors.red('Viewer WebSocket client disconnected'));
			});
		});

		console.log(
			colors.green(
				'Viewer WebSocket server started on port ' + VIEWER_PORT
			)
		);
	}
}
