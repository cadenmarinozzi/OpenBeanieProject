import fs from 'fs';
import http from 'http';
import { getConfig } from '../config/index.js';
import colors from 'colors/safe.js';

const config = getConfig();

const CLIENT_PORT = config.network.client.port;
const VIEWER_PORT = config.network.viewer.port;

export default class ViewerServer {
	constructor() {}

	getViewerFile = async () => {
		let data = await fs.promises.readFile('viewer/index.html', 'utf-8');
		data = data.replace('<VIEWER_PORT>', VIEWER_PORT);

		return data;
	};

	init = () => {
		http.createServer(async (req, res) => {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(await this.getViewerFile());

			console.log(colors.blue('Viewer server request received'));
		}).listen(CLIENT_PORT);

		console.log(
			colors.green('Viewer server started on port ' + CLIENT_PORT)
		);
	};
}
