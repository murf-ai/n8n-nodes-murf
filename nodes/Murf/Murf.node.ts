import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class Murf implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Murf AI',
		name: 'murf',
		icon: 'file:murf.svg',
		group: ['transform'],
		version: 1,
		description: 'Simple test node for Murf AI',
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
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: 'Hello from Murf AI!',
				description: 'The message to return',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const message = this.getNodeParameter('message', i) as string;
			returnData.push({
				json: {
					message,
				},
			});
		}

		return this.prepareOutputData(returnData);
	}
}
