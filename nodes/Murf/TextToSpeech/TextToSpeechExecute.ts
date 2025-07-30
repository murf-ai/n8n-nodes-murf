import type { IExecuteFunctions, IDataObject, INodeExecutionData, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function executeTextToSpeech(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const text = this.getNodeParameter('text', index) as string;
	const voiceId = this.getNodeParameter('voiceId', index) as string;
	const format = this.getNodeParameter('format', index) as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', index) as IDataObject;
	const multiNativeLocale = this.getNodeParameter('multiNativeLocale', index) as string;

	const credentials = await this.getCredentials('murfApi');

	const body: IDataObject = {
		text,
		voiceId,
		format,
		modelVersion: (additionalOptions.modelVersion as string) || 'GEN2',
	};

	if (multiNativeLocale) {
		body.multiNativeLocale = multiNativeLocale;
	}

	if (additionalOptions.channelType) {
		body.channelType = additionalOptions.channelType;
	}

	if (additionalOptions.sampleRate) {
		body.sampleRate = additionalOptions.sampleRate;
	}

	if (additionalOptions.audioDuration && additionalOptions.audioDuration !== 0) {
		body.audioDuration = additionalOptions.audioDuration;
	}

	if (additionalOptions.pitch !== undefined && additionalOptions.pitch !== 0) {
		body.pitch = additionalOptions.pitch;
	}

	if (additionalOptions.rate !== undefined && additionalOptions.rate !== 0) {
		body.rate = additionalOptions.rate;
	}

	if (additionalOptions.variation !== undefined && additionalOptions.variation !== 1) {
		body.variation = additionalOptions.variation;
	}

	if (additionalOptions.style) {
		body.style = additionalOptions.style;
	}

	if (additionalOptions.encodeAsBase64) {
		body.encodeAsBase64 = additionalOptions.encodeAsBase64;
	}

	if (additionalOptions.encodedAsBase64WithZeroRetention) {
		body.encodedAsBase64WithZeroRetention = additionalOptions.encodedAsBase64WithZeroRetention;
	}

	if (additionalOptions.wordDurationsAsOriginalText) {
		body.wordDurationsAsOriginalText = additionalOptions.wordDurationsAsOriginalText;
	}

	if (additionalOptions.pronunciationDictionary) {
		const pronunciationDict = additionalOptions.pronunciationDictionary as IDataObject;
		if (pronunciationDict.values && Array.isArray(pronunciationDict.values)) {
			const dict: IDataObject = {};
			for (const rule of pronunciationDict.values as IDataObject[]) {
				if (rule.word && rule.pronunciation && rule.type) {
					dict[rule.word as string] = {
						type: rule.type,
						pronunciation: rule.pronunciation,
					};
				}
			}
			if (Object.keys(dict).length > 0) {
				body.pronunciationDictionary = dict;
			}
		}
	}

	const options = {
		method: 'POST' as const,
		headers: {
			'Content-Type': 'application/json',
			'api-key': credentials.apiKey as string,
		},
		body: JSON.stringify(body),
		uri: 'https://api.murf.ai/v1/speech/generate',
		json: true,
	};

	try {
		const response = await this.helpers.request(options);

		return [
			{
				json: {
					audioFile: response.audioFile,
					audioLengthInSeconds: response.audioLengthInSeconds,
					consumedCharacterCount: response.consumedCharacterCount,
					remainingCharacterCount: response.remainingCharacterCount,
					wordDurations: response.wordDurations,
					encodedAudio: response.encodedAudio,
					warning: response.warning,
					request: {
						text,
						voiceId,
						format,
						modelVersion: (additionalOptions.modelVersion as string) || 'GEN2',
						...additionalOptions,
					},
				},
				binary: response.encodedAudio
					? {
							audio: {
								data: response.encodedAudio,
								mimeType: `audio/${format.toLowerCase()}`,
								fileName: `murf_speech.${format.toLowerCase()}`,
							},
						}
					: undefined,
			},
		];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Failed to synthesize speech with Murf AI',
			description: (error as Error).message || 'Unknown error occurred',
		});
	}
}
