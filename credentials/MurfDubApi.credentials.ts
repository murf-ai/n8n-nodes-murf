import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class MurfDubApi implements ICredentialType {
	name = 'murfDubApi';
	displayName = 'Murf Dub API';
	documentationUrl = 'https://murf.ai/api/docs/capabilities/dubbing';
	icon: Icon = 'file:murf.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'Murf Dub API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'The API key for Murf Dubbing. This is different from the regular Murf API key. Generate it from the MurfDub platform at https://dub.murf.ai/',
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
			url: 'https://api.murf.ai/v1/murfdub/list-destination-languages',
			headers: {
				'api-key': '={{$credentials.apiKey}}',
			},
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 200,
					message: 'Invalid Murf Dub API key or insufficient permissions',
				},
			},
		],
	};
}
