import { config } from 'dotenv';
config();

import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

export const generateVisionCompletion = async (
	messages,
	maxTokens = 2000,
	model = 'gpt-4o'
) => {
	const response = await openai.chat.completions.create({
		max_tokens: maxTokens,
		model,
		messages,
	});

	return response?.choices?.[0]?.message?.content.trim();
};
