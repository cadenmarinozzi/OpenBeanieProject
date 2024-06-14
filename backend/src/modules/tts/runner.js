import { spawn } from 'child_process';
import colors from 'colors/safe.js';

export const runTTS = async (text) => {
	return new Promise((resolve, reject) => {
		const pythonProcess = spawn('python', ['src/modules/tts/tts.py', text]);

		pythonProcess.stdout.on('data', (data) => {
			if (data.toString().includes('done')) {
				resolve();
			}
		});

		pythonProcess.stderr.on('data', (data) => {
			console.error(colors.red(data.toString()));
			reject();
		});
	});
};
