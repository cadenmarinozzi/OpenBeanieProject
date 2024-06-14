import WebSocket from 'ws';
import { getConfig } from '../config/index.js';
import colors from 'colors/safe.js';

const config = getConfig();

const VIEWER_PORT = config.network.viewer.port;
const RECONNECT_DELAY = config.reconnect_delay;

export default class ViewerWebSocket {
	sendData = (type, data) => {
		this.wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(
					JSON.stringify({
						type,
						data,
					})
				);
			}
		});
	};

	init() {
		try {
			this.wss = new WebSocket.Server({ port: VIEWER_PORT });

			this.wss.on('connection', (ws) => {
				console.log(colors.green('Viewer WebSocket client connected'));

				ws.on('close', () => {
					console.log(
						colors.red('Viewer WebSocket client disconnected')
					);
				});
			});

			console.log(
				colors.green(
					'Viewer WebSocket server started on port ' + VIEWER_PORT
				)
			);
		} catch (err) {
			console.log(colors.red('Viewer WebSocket server failed to start'));
			console.log(err);

			setTimeout(() => {
				this.init();
			}, RECONNECT_DELAY);
		}
	}
}
