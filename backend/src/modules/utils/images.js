export const imageDataToBase64 = (imageData, format = 'jpeg') => {
	return `data:image/${format};base64,${imageData}`;
};
