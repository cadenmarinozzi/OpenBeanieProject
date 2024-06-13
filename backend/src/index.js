import { config } from 'dotenv';
config();

import fs from 'fs';
import ViewerServer from './modules/client/viewerServer.js';
import ServerWebSocket from './modules/server/websocket.js';
import ViewerWebSocket from './modules/client/viewerWebsocket.js';

if (!fs.existsSync('temp')) {
	fs.mkdirSync('temp');
}

const viewer = new ViewerWebSocket();
viewer.init();

const server = new ServerWebSocket(viewer);
server.init();

const viewerServer = new ViewerServer();
viewerServer.init();
