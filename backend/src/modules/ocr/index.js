import { createWorker } from 'tesseract.js';

export const recognize = async (image) => {
	const worker = await createWorker('eng');
	const { data } = await worker.recognize(image);

	await worker.terminate();

	return data.text;
};
