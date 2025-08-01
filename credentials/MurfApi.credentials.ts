import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MurfApi implements ICredentialType {
	name = 'murfApi';
	displayName = 'Murf API';
	documentationUrl = 'https://murf.ai/api/docs/introduction/quickstart';
	properties: INodeProperties[] = [
		{
			displayName: 'Murf API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'The API key for Murf AI. You can find your API key in your Murf account settings.',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			url: 'https://api.murf.ai/v1/speech/voices',
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'voices',
					value: 'array',
					message: 'Invalid API key or insufficient permissions for Murf API',
				},
			},
		],
	};
}
