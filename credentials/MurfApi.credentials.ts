import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MurfApi implements ICredentialType {
	name = 'murfApi';
	displayName = 'Murf API';
	documentationUrl = 'https://murf.ai/api/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'Test Key',
			name: 'testKey',
			type: 'string',
			default: '',
			description: 'Test key for development',
		},
	];
}
