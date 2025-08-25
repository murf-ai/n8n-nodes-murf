import type { IExecuteFunctions, IDataObject, INodeExecutionData, JsonObject } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

type AudioFormat = 'WAV' | 'MP3' | 'FLAC' | 'ALAW' | 'ULAW' | 'PCM' | 'OGG';
type ChannelType = 'MONO' | 'STEREO';
type SampleRate = 8000 | 24000 | 44100 | 48000;

interface FormatConstraints {
	channelTypes: ChannelType[];
	sampleRates: SampleRate[];
}

const AUDIO_FORMAT_CONSTRAINTS: Record<AudioFormat, FormatConstraints> = {
	WAV: { channelTypes: ['MONO', 'STEREO'], sampleRates: [8000, 24000, 44100, 48000] },
	MP3: { channelTypes: ['MONO', 'STEREO'], sampleRates: [8000, 24000, 44100, 48000] },
	FLAC: { channelTypes: ['MONO', 'STEREO'], sampleRates: [8000, 24000, 44100, 48000] },
	ALAW: { channelTypes: ['MONO'], sampleRates: [8000] },
	ULAW: { channelTypes: ['MONO'], sampleRates: [8000] },
	PCM: { channelTypes: ['MONO', 'STEREO'], sampleRates: [8000, 24000, 44100, 48000] },
	OGG: { channelTypes: ['MONO', 'STEREO'], sampleRates: [8000, 24000, 44100, 48000] },
};

export async function executeTextToSpeech(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const text = this.getNodeParameter('text', index) as string;


	const voiceIdParam = this.getNodeParameter('voiceId', index) as any;
	let voiceId: string;
	if (typeof voiceIdParam === 'object' && voiceIdParam.value) {
		voiceId = voiceIdParam.value;
	} else if (typeof voiceIdParam === 'string') {
		voiceId = voiceIdParam;
	} else {
		throw new NodeApiError(this.getNode(), {
			message: 'Invalid voice ID parameter',
			description: 'Please select a valid voice',
		} as JsonObject);
	}

	const format = (this.getNodeParameter('format', index) as string).toUpperCase() as AudioFormat;


	const multiNativeLocaleParam = this.getNodeParameter('multiNativeLocale', index) as any;
	let multiNativeLocale: string = '';
	if (typeof multiNativeLocaleParam === 'object' && multiNativeLocaleParam.value) {
		multiNativeLocale = multiNativeLocaleParam.value;
	} else if (typeof multiNativeLocaleParam === 'string') {
		multiNativeLocale = multiNativeLocaleParam;
	}

	const encodeAsBase64 = this.getNodeParameter('encodeAsBase64', index) as boolean;

	// Handle resourceLocator for style
	const styleParam = this.getNodeParameter('style', index) as any;
	let style: string = '';
	if (typeof styleParam === 'object' && styleParam.value) {
		style = styleParam.value;
	} else if (typeof styleParam === 'string') {
		style = styleParam;
	}

	const additionalOptions = this.getNodeParameter('additionalOptions', index) as IDataObject;

	if (!AUDIO_FORMAT_CONSTRAINTS[format]) {
		throw new NodeApiError(this.getNode(), {
			message: `Invalid audio format: ${format}`,
			description: `Supported formats are: ${Object.keys(AUDIO_FORMAT_CONSTRAINTS).join(', ')}`,
		} as JsonObject);
	}

	if (additionalOptions.channelType && !AUDIO_FORMAT_CONSTRAINTS[format].channelTypes.includes(additionalOptions.channelType as ChannelType)) {
		throw new NodeApiError(this.getNode(), {
			message: `Invalid channel type for ${format}: ${additionalOptions.channelType}`,
			description: `Supported channel types for ${format} are: ${AUDIO_FORMAT_CONSTRAINTS[format].channelTypes.join(', ')}`,
		} as JsonObject);
	}

	if (additionalOptions.sampleRate && !AUDIO_FORMAT_CONSTRAINTS[format].sampleRates.includes(additionalOptions.sampleRate as SampleRate)) {
		throw new NodeApiError(this.getNode(), {
			message: `Invalid sample rate for ${format}: ${additionalOptions.sampleRate}`,
			description: `Supported sample rates for ${format} are: ${AUDIO_FORMAT_CONSTRAINTS[format].sampleRates.join(', ')}`,
		} as JsonObject);
	}

	const credentials = await this.getCredentials('murfApi');

	const body: IDataObject = {
		text,
		voiceId,
		format,
		encodeAsBase64,
		modelVersion: 'GEN2',
	};

	if (multiNativeLocale) {
		body.multiNativeLocale = multiNativeLocale;
	}

	if (style) {
		body.style = style;
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
			'accept-encoding': 'gzip',
		},
		body: JSON.stringify(body),
		uri: 'https://api.murf.ai/v1/speech/generate',
		json: true,
		gzip: true,
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
						...body,
					},
				},
				binary: response.encodedAudio
					? {
							data: {
								data: response.encodedAudio,
								mimeType: `audio/${format.toLowerCase()}`,
								fileName: `murf_speech.${format.toLowerCase()}`,
								fileExtension: format.toLowerCase(),
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
