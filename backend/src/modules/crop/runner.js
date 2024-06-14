import spawn from 'child_process';
import colors from 'colors/safe.js';

export const runCropper = async () => {
	return new Promise((resolve, reject) => {
		const pythonProcess = spawn('python', [
			'src/modules/crop/crop.py',
			'temp/image.jpg',
		]);

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
