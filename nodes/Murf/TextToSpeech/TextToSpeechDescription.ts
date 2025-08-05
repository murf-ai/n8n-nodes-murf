import type { INodeProperties } from 'n8n-workflow';

export const textToSpeechDescription: INodeProperties[] = [
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 4,
			alwaysOpenEditWindow: true,
			multiLineExpression: true,
		},
		default: '',
		required: true,
		description:
			'The text that is to be synthesized. You can use tags like [pause 1s] for enhanced control.',
		placeholder: 'Hello world [pause 1s], welcome to n8n murf node',
	},
	{
		displayName: 'Voice ID',
		name: 'voiceId',
		type: 'options',
		options: [
			{
				name: 'Natalie (US English)',
				value: 'en-US-natalie',
			},
			{
				name: 'Ruby (UK English)',
				value: 'en-UK-ruby',
			},
			{
				name: 'Amara (US English)',
				value: 'en-US-amara',
			},
		],
		default: 'en-US-natalie',
		required: true,
		description:
			'The voice to use for synthesis. Visit https://murf.ai/api/dashboard to discover more voice IDs.',
	},
	{
		displayName: 'Multi Native Locale',
		name: 'multiNativeLocale',
		type: 'string',
		default: '',
		description:
			'Language for generated audio (e.g., "en-US", "es-ES", "en-UK", "fr-FR"). Default value depends on the selected voice.',
		placeholder: 'en-US',
	},
	{
		displayName: 'Audio Format',
		name: 'format',
		type: 'options',
		options: [
			{
				name: 'ALAW',
				value: 'ALAW',
			},
			{
				name: 'FLAC',
				value: 'FLAC',
			},
			{
				name: 'MP3',
				value: 'MP3',
			},
			{
				name: 'OGG',
				value: 'OGG',
			},
			{
				name: 'PCM',
				value: 'PCM',
			},
			{
				name: 'ULAW',
				value: 'ULAW',
			},
			{
				name: 'WAV',
				value: 'WAV',
			},
		],
		default: 'WAV',
		description: 'Format of the generated audio file',
	},
	{
		displayName: 'Encode as Base64',
		name: 'encodeAsBase64',
		type: 'boolean',
		default: false,
		description: 'Whether to receive audio as Base64 encoded string instead of URL',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Audio Duration (Seconds)',
				name: 'audioDuration',
				type: 'number',
				default: 0,
				description:
					'Specify duration for generated audio in seconds. Set to 0 to ignore. Only available for Gen2 model.',
				typeOptions: {
					minValue: 0,
				},
			},
			{
				displayName: 'Channel Type',
				name: 'channelType',
				type: 'options',
				options: [
					{
						name: 'Mono',
						value: 'MONO',
					},
					{
						name: 'Stereo',
						value: 'STEREO',
					},
				],
				default: 'MONO',
				description: 'Audio channel configuration',
			},
			{
				displayName: 'Pitch',
				name: 'pitch',
				type: 'number',
				default: 0,
				description: 'Pitch adjustment for the voice (-50 to 50)',
				typeOptions: {
					minValue: -50,
					maxValue: 50,
				},
			},
			{
				displayName: 'Pronunciation Dictionary',
				name: 'pronunciationDictionary',
				type: 'fixedCollection',
				default: { values: [] },
				description: 'Custom pronunciations for specific words',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'values',
						displayName: 'Pronunciation Rules',
						values: [
							{
								displayName: 'Word',
								name: 'word',
								type: 'string',
								default: '',
								description: 'The word to customize pronunciation for',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'IPA',
										value: 'IPA',
										description: 'International Phonetic Alphabet',
									},
									{
										name: 'SAY_AS',
										value: 'SAY_AS',
										description: 'Say as specified text',
									},
								],
								default: 'IPA',
								description: 'Type of pronunciation specification',
							},
							{
								displayName: 'Pronunciation',
								name: 'pronunciation',
								type: 'string',
								default: '',
								description: 'The pronunciation to use (IPA notation or text)',
							},
						],
					},
				],
			},
			{
				displayName: 'Rate (Speed)',
				name: 'rate',
				type: 'number',
				default: 0,
				description: 'Speed adjustment for the voice (-50 to 50)',
				typeOptions: {
					minValue: -50,
					maxValue: 50,
				},
			},
			{
				displayName: 'Sample Rate',
				name: 'sampleRate',
				type: 'options',
				options: [
					{
						name: '8000 Hz',
						value: 8000,
					},
					{
						name: '24000 Hz',
						value: 24000,
					},
					{
						name: '44100 Hz',
						value: 44100,
					},
					{
						name: '48000 Hz',
						value: 48000,
					},
				],
				default: 44100,
				description: 'Sample rate for the audio output',
			},
			{
				displayName: 'Variation',
				name: 'variation',
				type: 'number',
				default: 1,
				description:
					'Higher values add more variation in pause, pitch, and speed (0-5). Only available for Gen2 model.',
				typeOptions: {
					minValue: 0,
					maxValue: 5,
				},
			},
			{
				displayName: 'Voice Style',
				name: 'style',
				type: 'string',
				default: '',
				description: 'The voice style to be used for voiceover generation',
			},
			{
				displayName: 'Word Durations as Original Text',
				name: 'wordDurationsAsOriginalText',
				type: 'boolean',
				default: false,
				description:
					'Whether word durations should return words as original input text (English only)',
			},
		],
	},
];
