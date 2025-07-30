import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import { textToSpeechDescription, executeTextToSpeech } from './TextToSpeech';

export class Murf implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Murf AI',
		name: 'murf',
		icon: 'file:murf.svg',
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
						name: 'Coming Soon',
						value: 'comingSoon',
						description: 'Voice changer functionality will be available soon',
						action: 'Coming soon a voice changer',
					},
				],
				default: 'comingSoon',
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
						name: 'Coming Soon',
						value: 'comingSoon',
						description: 'Translation functionality will be available soon',
						action: 'Coming soon a translations',
					},
				],
				default: 'comingSoon',
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
		],
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
				} else if (resource === 'voiceChanger' || resource === 'translations') {
					throw new NodeOperationError(
						this.getNode(),
						`${resource} functionality is coming soon. Currently only Text to Speech is supported.`,
					);
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
