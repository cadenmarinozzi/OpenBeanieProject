export const createGestureMessages = (image) => [
	{
		role: 'system',
		content:
			'States: point, thumbs_up, thumbs_down, fist_closed, palm_up, palm_down, none',
	},
	{
		role: 'system',
		content:
			'Your task is to identify the hand gesture shown. Respond with a gesture from the states and nothing else',
	},
	{
		role: 'user',
		content: [
			{
				type: 'image_url',
				image_url: {
					url: image,
					detail: 'low',
				},
			},
			{
				type: 'text',
				text: 'Respond with what hand gesture state the image is in',
			},
		],
	},
];

export const createMessages = (history, image, prompt) => [
	...Object.keys(history).map((time) => {
		const message = history[time];

		return {
			role: 'assistant',
			content: `Date and time: ${time}\n\n${message}`,
		};
	}),
	{
		role: 'user',
		content: [
			{
				type: 'image_url',
				image_url: {
					url: image,
					detail: 'low',
				},
			},
			{
				type: 'text',
				text: prompt,
			},
		],
	},
];
