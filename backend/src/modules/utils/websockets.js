export const createWebsocketURL = (ip, port, secure) => {
	const protocol = secure ? 'wss' : 'ws';

	return `${protocol}://${ip}:${port}`;
};
