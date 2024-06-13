import { config } from 'dotenv';
config();

import fs from 'fs';
import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';

fs.exists('temp', (exists) => {
	if (!exists) {
		fs.mkdirSync('temp');
	}
});

const { WATSON_API_KEY, WATSON_SERVICE_URL } = process.env;

const textToSpeech = new TextToSpeechV1({
	authenticator: new IamAuthenticator({ apikey: WATSON_API_KEY }),
	serviceUrl: WATSON_SERVICE_URL,
});

export const generateTTSAudio = async (text) => {
	const params = {
		text,
		voice: 'en-AU_JackExpressive',
		accept: 'audio/wav',
	};

	const { result } = await textToSpeech.synthesize(params);

	const stream = await textToSpeech.repairWavHeaderStream(result);
	fs.writeFileSync('temp/audio.wav', stream);
};
