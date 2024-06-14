import Jimp from 'jimp';

export const rotate90 = (image) => {
	return new Promise(async (resolve) => {
		const buf = Buffer.from(image, 'base64');
		const jimg = await Jimp.read(buf);

		jimg.rotate(90).getBase64(Jimp.AUTO, (err, src) => resolve(src));
	});
};
