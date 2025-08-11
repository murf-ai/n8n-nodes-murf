import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeListSearchResult,
} from 'n8n-workflow';

import { NodeConnectionType } from 'n8n-workflow';

import { textToSpeechDescription, executeTextToSpeech } from './TextToSpeech';
import { translationDescription, executeTranslation } from './Translations';
import { voiceChangerDescription, executeVoiceChanger } from './VoiceChanger';
import { dubbingDescription } from './Dubbing/DubbingDescription';
import { executeDubbing, checkJobStatus } from './Dubbing/DubbingExecute';

export class Murf implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Murf AI',
		name: 'murf',
		icon: 'file:../murf.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Murf AI APIs to generate speech, dubbing, and more',
		defaults: {
			name: 'Murf AI',
		},
		credentials: [
			{
				name: 'murfApi',
				required: true,
				displayOptions: {
					show: {
						resource: ['textToSpeech', 'voiceChanger', 'translations'],
					},
				},
			},
			{
				name: 'murfDubApi',
				required: true,
				displayOptions: {
					show: {
						resource: ['dubbing'],
					},
				},
			},
		],
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Text to Speech',
						value: 'textToSpeech',
						description: 'Convert text to speech using AI voices',
					},
					{
						name: 'Voice Changer',
						value: 'voiceChanger',
						description: 'Change voice characteristics of audio files',
					},
					{
						name: 'Translation',
						value: 'translations',
						description: 'Translate content between languages',
					},
					{
						name: 'Dubbing',
						value: 'dubbing',
						description: 'Automated dubbing in multiple languages',
					},
				],
				default: 'textToSpeech',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['textToSpeech'],
					},
				},
				options: [
					{
						name: 'Generate Speech',
						value: 'generate',
						description: 'Convert text to speech',
						action: 'Generate speech from text',
					},
				],
				default: 'generate',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['voiceChanger'],
					},
				},
				options: [
					{
						name: 'Convert Voice',
						value: 'convert',
						description: 'Change voice characteristics of audio files',
						action: 'Change voice of audio files',
					},
				],
				default: 'convert',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['translations'],
					},
				},
				options: [
					{
						name: 'Translate',
						value: 'translate',
						description: 'Translate text to another language',
						action: 'Translate text to another language',
					},
				],
				default: 'translate',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['dubbing'],
					},
				},
				options: [
					{
						name: 'Create Dubbing Job',
						value: 'createJob',
						description: 'Create a new dubbing job',
						action: 'Create a dubbing job',
					},
					{
						name: 'Check Job Status',
						value: 'checkStatus',
						description: 'Check the status of a dubbing job',
						action: 'Check dubbing job status',
					},
				],
				default: 'createJob',
			},
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['dubbing'],
						operation: ['checkStatus'],
					},
				},
				default: '',
				description: 'The ID of the dubbing job to check',
			},
			...textToSpeechDescription.map((field) => ({
				...field,
				displayOptions: {
					show: {
						resource: ['textToSpeech'],
						operation: ['generate'],
					},
				},
			})),
			...voiceChangerDescription.map((field) => ({
				...field,
				displayOptions: {
					show: {
						resource: ['voiceChanger'],
						operation: ['convert'],
					},
				},
			})),
			...translationDescription.map((field) => ({
				...field,
				displayOptions: {
					show: {
						resource: ['translations'],
						operation: ['translate'],
					},
				},
			})),
			...dubbingDescription.map((field) => ({
				...field,
				displayOptions: {
					show: {
						resource: ['dubbing'],
						operation: ['createJob'],
					},
				},
			})),
		],
	};

	methods = {
		listSearch: {
			async getVoices(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('murfApi');

				const options = {
					method: 'GET' as const,
					headers: {
						'api-key': credentials.apiKey as string,
						'Content-Type': 'application/json',
					},
					uri: 'https://api.murf.ai/v1/speech/voices',
					json: true,
				};

				const voicesResponse = await this.helpers.request(options);

				let voices: INodePropertyOptions[] = [];

				if (Array.isArray(voicesResponse)) {
					for (const voice of voicesResponse) {
						const voiceId = voice.voiceId;
						const voiceName = voice.displayName;
						const language = voice.displayLanguage;

						voices.push({
							name: voiceName,
							value: voiceId,
							description: language ? `${language}` : '',
						});
					}
				}
				if (filter) {
					const filterLower = filter.toLowerCase();
					voices = voices.filter(
						(voice) =>
							String(voice.name).toLowerCase().includes(filterLower) ||
							String(voice.description).toLowerCase().includes(filterLower),
					);
				}

				return {
					results: voices,
				};
			},
			async getSupportedLocales(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('murfApi');

				let selectedVoiceId: string | null = null;

				try {
					const voiceParam = this.getCurrentNodeParameter('voiceId');
					if (voiceParam && typeof voiceParam === 'object' && 'value' in voiceParam) {
						selectedVoiceId = voiceParam.value as string;
					} else if (typeof voiceParam === 'string') {
						selectedVoiceId = voiceParam;
					}
				} catch (error) {
					return { results: [] };
				}

				if (!selectedVoiceId) {
					return { results: [] };
				}

				const options = {
					method: 'GET' as const,
					headers: {
						'api-key': credentials.apiKey as string,
						'Content-Type': 'application/json',
					},
					uri: 'https://api.murf.ai/v1/speech/voices',
					json: true,
				};

				const voicesResponse = await this.helpers.request(options);

				if (Array.isArray(voicesResponse)) {
					const selectedVoice = voicesResponse.find((voice) => voice.voiceId === selectedVoiceId);

					if (selectedVoice && selectedVoice.supportedLocales) {
						let localeOptions: INodePropertyOptions[] = [];

						for (const [localeCode, localeInfo] of Object.entries(selectedVoice.supportedLocales)) {
							localeOptions.push({
								name: `${(localeInfo as any).detail}`,
								value: localeCode,
								description: `Available styles: ${(localeInfo as any).availableStyles?.join(', ') || 'None'}`,
							});
						}

						localeOptions.sort((a, b) => {
							if (a.name.includes('(Default)')) return -1;
							if (b.name.includes('(Default)')) return 1;
							return a.name.localeCompare(b.name);
						});

						if (filter) {
							const filterLower = filter.toLowerCase();
							localeOptions = localeOptions.filter(
								(locale) =>
									String(locale.name).toLowerCase().includes(filterLower) ||
									String(locale.value).toLowerCase().includes(filterLower),
							);
						}

						return {
							results: localeOptions,
						};
					}
				}

				return {
					results: [
						{
							name: 'English (US & Canada) (Default)',
							value: 'en-US',
							description: 'Default English locale',
						},
					],
				};
			},
			async getAvailableStyles(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('murfApi');

				let selectedVoiceId: string | null = null;
				let selectedLocale: string | null = null;

				try {
					const voiceParam = this.getCurrentNodeParameter('voiceId');
					if (voiceParam && typeof voiceParam === 'object' && 'value' in voiceParam) {
						selectedVoiceId = voiceParam.value as string;
					} else if (typeof voiceParam === 'string') {
						selectedVoiceId = voiceParam;
					}

					const localeParam = this.getCurrentNodeParameter('multiNativeLocale');
					if (localeParam && typeof localeParam === 'object' && 'value' in localeParam) {
						selectedLocale = localeParam.value as string;
					} else if (typeof localeParam === 'string') {
						selectedLocale = localeParam;
					}
				} catch (error) {
					return {
						results: [{
							name: 'Please Select Voice and Locale First',
							value: '',
							description: 'Select a voice and locale to see available styles'
						}]
					};
				}

				if (!selectedVoiceId) {
					return {
						results: [{
							name: 'Please Select a Voice First',
							value: '',
							description: 'Select a voice to see available styles'
						}]
					};
				}

				const options = {
					method: 'GET' as const,
					headers: {
						'api-key': credentials.apiKey as string,
						'Content-Type': 'application/json',
					},
					uri: 'https://api.murf.ai/v1/speech/voices',
					json: true,
				};

				const voicesResponse = await this.helpers.request(options);

				if (Array.isArray(voicesResponse)) {
					const selectedVoice = voicesResponse.find((voice) => voice.voiceId === selectedVoiceId);

					if (selectedVoice) {
						let availableStyles: string[] = [];

						if (selectedLocale && selectedVoice.supportedLocales && selectedVoice.supportedLocales[selectedLocale]) {
							availableStyles = selectedVoice.supportedLocales[selectedLocale].availableStyles || [];
						}
						else if (selectedVoice.availableStyles) {
							availableStyles = selectedVoice.availableStyles;
						}

						if (availableStyles.length > 0) {
							let styleOptions: INodePropertyOptions[] = availableStyles.map((style: string) => ({
								name: style,
								value: style,
								description: `${style} voice style`,
							}));

							if (filter) {
								const filterLower = filter.toLowerCase();
								styleOptions = styleOptions.filter(
									(style) =>
										String(style.name).toLowerCase().includes(filterLower) ||
										String(style.value).toLowerCase().includes(filterLower),
								);
							}

							return {
								results: styleOptions,
							};
						} else {
							return {
								results: [{
									name: 'No Styles Available',
									value: '',
									description: 'No voice styles available for this voice and locale combination'
								}],
							};
						}
					} else {
						return {
							results: [{
								name: 'Voice Not Found',
								value: '',
								description: 'Selected voice not found in available voices'
							}],
						};
					}
				}

				return {
					results: [
						{
							name: 'General',
							value: 'General',
							description: 'Natural tone',
						},
					],
				};
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				if (resource === 'textToSpeech') {
					if (operation === 'generate') {
						responseData = await executeTextToSpeech.call(this, i);
					}
				} else if (resource === 'voiceChanger') {
					if (operation === 'convert') {
						responseData = await executeVoiceChanger.call(this, i);
					}
				} else if (resource === 'translations') {
					if (operation === 'translate') {
						responseData = await executeTranslation.call(this, i);
					}
				} else if (resource === 'dubbing') {
					if (operation === 'createJob') {
						responseData = await executeDubbing.call(this, i);
					} else if (operation === 'checkStatus') {
						responseData = await checkJobStatus.call(this, i);
					}
				}

				if (responseData && Array.isArray(responseData)) {
					returnData.push(...responseData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return this.prepareOutputData(returnData);
	}
}
