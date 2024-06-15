import { config } from 'dotenv';
config();

import fs from 'fs';
import ViewerServer from './modules/client/viewerServer.js';
import ServerWebSocket from './modules/server/websocket.js';
import ViewerWebSocket from './modules/client/viewerWebsocket.js';
import { HandRecognition } from './modules/handRecognition/runner.js';

if (!fs.existsSync('temp')) {
	fs.mkdirSync('temp');
}

process.on('SIGINT', () => {
	process.exit();
});

const init = async () => {
	const handRecognizer = new HandRecognition();

	handRecognizer.initWebsocket();
	handRecognizer.initPython();

	const viewer = new ViewerWebSocket();
	viewer.init();

	const server = new ServerWebSocket(viewer, handRecognizer);
	server.init();

	const viewerServer = new ViewerServer();
	viewerServer.init();
};

init();
