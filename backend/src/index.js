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

const init = async () => {
	const handRecognizer = new HandRecognition();

	await handRecognizer.initPython();
	await handRecognizer.initWebsocket();

	const viewer = new ViewerWebSocket();
	viewer.init();

	const server = new ServerWebSocket(viewer, handRecognizer);
	server.init();

	const viewerServer = new ViewerServer();
	viewerServer.init();
};

init();
