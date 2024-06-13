import fs from 'fs';

export const getConfig = () => {
	const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

	return config;
};
