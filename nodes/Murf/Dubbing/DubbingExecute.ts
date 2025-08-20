import type { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { JsonObject } from 'n8n-workflow';

export async function executeDubbing(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const inputType = this.getNodeParameter('inputType', itemIndex) as string;
	const fileName = this.getNodeParameter('fileName', itemIndex) as string;
	const targetLocales = (this.getNodeParameter('targetLocales', itemIndex) as string[])
	.map((locale) => locale.trim());
	const priority = this.getNodeParameter('priority', itemIndex) as string;
	const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex) as string;
	const webhookSecret = this.getNodeParameter('webhookSecret', itemIndex) as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex) as {
		createProject?: boolean;
		projectId?: string;
	};

	const createProject = additionalOptions.createProject || false;
	const projectId = additionalOptions.projectId;

	const credentials = await this.getCredentials('murfDubApi');
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

	try {
		const endpoint = createProject
			? 'https://api.murf.ai/v1/murfdub/jobs/create-with-project-id'
			: 'https://api.murf.ai/v1/murfdub/jobs/create';

		let options: any = {
			method: 'POST' as IHttpRequestMethods,
			url: endpoint,
			headers: {
				'api-key': credentials.apiKey,
			},
			formData: {
				target_locales: targetLocales,
				file_name: fileName,
				priority,
				dubbing_type: 'AUTOMATED',
			},
		};

		if (webhookUrl) {
			options.formData.webhook_url = webhookUrl;
		}

		if (webhookSecret) {
			options.formData.webhook_secret = webhookSecret;
		}

		if (createProject && projectId) {
			options.formData.project_id = projectId;
		}

		if (inputType === 'file') {
			const binaryData = this.helpers.assertBinaryData(itemIndex, 'data');
			options.formData.file = {
				value: Buffer.from(binaryData.data, 'base64'),
				options: {
					filename: binaryData.fileName || fileName,
					contentType: binaryData.mimeType,
				},
			};
		} else if (inputType === 'url') {
			const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
			if (!fileUrl) {
				throw new NodeOperationError(this.getNode(), 'No file URL provided!');
			}
			options.formData.file_url = fileUrl;
		}

		const response = await this.helpers.request(options);
		const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;

		const executionData: INodeExecutionData[] = [{
			json: {
				jobId: parsedResponse.job_id,
				dubbingType: parsedResponse.dubbing_type,
				fileName: parsedResponse.file_name,
				priority: parsedResponse.priority,
				targetLocales: parsedResponse.target_locales,
				sourceLocale: parsedResponse.source_locale,
				fileUrl: parsedResponse.file_url,
				webhookUrl: parsedResponse.webhook_url,
				projectId: parsedResponse.project_id,
				warning: parsedResponse.warning,
				status: 'CREATED',
				createdAt: new Date().toISOString(),
			},
		}];

		return executionData;
	} catch (error) {
		if (error.response?.data) {
			const errorData = error.response.data;

			switch (errorData.error_code) {
				case 'INSUFFICIENT_CREDITS':
					throw new NodeOperationError(
						this.getNode(),
						'Insufficient credits. Please purchase additional credits to continue.'
					);
				case 'CREDITS_EXHAUSTED':
					throw new NodeOperationError(
						this.getNode(),
						'Your credits have been exhausted. Please purchase additional credits to continue.'
					);
				case 'LANGUAGE_NOT_SUPPORTED':
					throw new NodeOperationError(
						this.getNode(),
						'The specified language is not yet supported.'
					);
				case 'SPEECH_NOT_PRESENT':
					throw new NodeOperationError(
						this.getNode(),
						'No speech detected in the audio.'
					);
				case 'SOURCE_LANGUAGE_MISMATCH':
					throw new NodeOperationError(
						this.getNode(),
						'Source language does not match the provided language.'
					);
				case 'WEBHOOK_ERROR':
					throw new NodeOperationError(
						this.getNode(),
						'An error occurred while calling the webhook. Please verify the webhook URL.'
					);
				case 'SERVER_ERROR':
					throw new NodeOperationError(
						this.getNode(),
						'Processing failed. Please contact Murf support.'
					);
				default:
					throw new NodeOperationError(
						this.getNode(),
						`Murf API error: ${errorData.message || error.message}`
					);
			}
		}

		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Failed to create dubbing job with Murf AI',
			description: (error as Error).message || 'Unknown error occurred',
		});
	}
}

export async function checkJobStatus(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const jobId = this.getNodeParameter('jobId', itemIndex) as string;

	const credentials = await this.getCredentials('murfDubApi');
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

	try {
		const options = {
			method: 'GET' as IHttpRequestMethods,
			url: `https://api.murf.ai/v1/murfdub/jobs/${jobId}/status`,
			headers: {
				'api-key': credentials.apiKey,
			},
		};

		const response = await this.helpers.request(options);
		const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;

		const executionData: INodeExecutionData[] = [{
			json: {
				jobId: parsedResponse.job_id,
				status: parsedResponse.status,
				projectId: parsedResponse.project_id,
				downloadDetails: parsedResponse.download_details,
				creditsUsed: parsedResponse.credits_used,
				creditsRemaining: parsedResponse.credits_remaining,
				failureReason: parsedResponse.failure_reason,
				failureCode: parsedResponse.failure_code,
			},
		}];

		return executionData;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Failed to check job status with Murf AI',
			description: (error as Error).message || 'Unknown error occurred',
		});
	}
}
