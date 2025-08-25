import type { INodeProperties } from 'n8n-workflow';

export const voiceChangerDescription: INodeProperties[] = [
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		required: true,
		default: 'file',
		options: [
			{
				name: 'File',
				value: 'file',
				description: 'Upload an audio file',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Use a publicly accessible audio URL',
			},
		],
		description: 'Whether to upload a file or use a URL',
	},
	{
		displayName: 'File',
		name: 'file',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				inputType: ['file'],
			},
		},
		description: 'The audio file to convert. All major audio formats are supported.',
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		displayOptions: {
			show: {
				inputType: ['url'],
			},
		},
		default: '',
		description: 'URL of the audio file (must be publicly accessible)',
	},
	{
		displayName: 'Voice',
		description: 'Select the voice to use for the voice conversion',
		name: 'voiceId',
		type: 'resourceLocator',
		default: { mode: 'list', value: null },
		required: true,
		modes: [
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getVoices',
					searchable: true,
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				placeholder: 'en-US-natalie',
			},
		],
	},
	{
		displayName: 'Output Format',
		name: 'format',
		type: 'options',
		noDataExpression: true,
		default: 'WAV',
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
				name: 'ULAW',
				value: 'ULAW',
			},
			{
				name: 'WAV',
				value: 'WAV',
			},
		],
		description: 'Format of the output audio file',
	},
	{
		displayName: 'Channel Type',
		name: 'channelType',
		type: 'options',
		noDataExpression: true,
		default: 'MONO',
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
		description: 'Audio channel type',
	},
	{
		displayName: 'Sample Rate',
		name: 'sampleRate',
		type: 'options',
		noDataExpression: true,
		default: 8000,
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
		description: 'Audio sample rate in Hz',
	},
	{
		displayName: 'Encode as Base64',
		name: 'encodeAsBase64',
		type: 'boolean',
		noDataExpression: true,
		default: false,
		description: 'Whether to receive audio as Base64 encoded string instead of URL',
	},
];
