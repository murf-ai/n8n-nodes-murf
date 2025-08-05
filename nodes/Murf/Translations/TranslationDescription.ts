import type { INodeProperties } from 'n8n-workflow';

export const translationDescription: INodeProperties[] = [
	{
		displayName: 'Target Language',
		name: 'targetLanguage',
		type: 'options',
		required: true,
		default: 'en-US',
		options: [
			{
				name: 'Bengali - India',
				value: 'bn-IN',
			},
			{
				name: 'Chinese - China',
				value: 'zh-CN',
			},
			{
				name: 'Croatian - Croatia',
				value: 'hr-HR',
			},
			{
				name: 'Dutch - Netherlands',
				value: 'nl-NL',
			},
			{
				name: 'English - Australia',
				value: 'en-AU',
			},
			{
				name: 'English - India',
				value: 'en-IN',
			},
			{
				name: 'English - Scotland',
				value: 'en-SCOTT',
			},
			{
				name: 'English - UK',
				value: 'en-UK',
			},
			{
				name: 'English - US & Canada',
				value: 'en-US',
			},
			{
				name: 'French - France',
				value: 'fr-FR',
			},
			{
				name: 'German - Germany',
				value: 'de-DE',
			},
			{
				name: 'Greek - Greece',
				value: 'el-GR',
			},
			{
				name: 'Hindi - India',
				value: 'hi-IN',
			},
			{
				name: 'Italian - Italy',
				value: 'it-IT',
			},
			{
				name: 'Japanese - Japan',
				value: 'ja-JP',
			},
			{
				name: 'Korean - Korea',
				value: 'ko-KR',
			},
			{
				name: 'Polish - Poland',
				value: 'pl-PL',
			},
			{
				name: 'Portuguese - Brazil',
				value: 'pt-BR',
			},
			{
				name: 'Slovak - Slovakia',
				value: 'sk-SK',
			},
			{
				name: 'Spanish - Mexico',
				value: 'es-MX',
			},
			{
				name: 'Spanish - Spain',
				value: 'es-ES',
			},
			{
				name: 'Tamil - India',
				value: 'ta-IN',
			},
		],
		description: 'The target language for translation',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		description: 'The text to translate (up to 4,000 characters per sentence, max 10 sentences per request)',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Batch Mode',
				name: 'batchMode',
				type: 'boolean',
				default: false,
				description: 'Whether to process multiple texts as a batch (one sentence per line, max 10 sentences)',
			},
		],
	},
];

