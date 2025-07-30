import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MurfApi implements ICredentialType {
	name = 'murfApi';
	displayName = 'Murf AI API';
	documentationUrl = 'https://help.murf.ai/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'The API key for Murf AI. You can find your API key in your Murf account settings.',
			required: true,
		},
	];
}
