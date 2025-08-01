import type { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function executeTranslation(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const targetLanguage = this.getNodeParameter('targetLanguage', itemIndex) as string;
	const text = this.getNodeParameter('text', itemIndex) as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex) as {
		batchMode?: boolean;
	};

	const credentials = await this.getCredentials('murfApi');
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

	try {
		const options = {
			method: 'POST' as IHttpRequestMethods,
			url: 'https://api.murf.ai/v1/text/translate',
			headers: {
				'api-key': credentials.apiKey,
				'Content-Type': 'application/json',
			},
			body: {
				target_language: targetLanguage,
				texts: additionalOptions.batchMode ? text.split('\n') : [text],
			},
			json: true,
		};

		// Make API request
		const response = await this.helpers.request(options);

		// Process the response
		const executionData: INodeExecutionData[] = [];

		if (response.translations) {
			response.translations.forEach((translation: { source_text: string; translated_text: string }) => {
				executionData.push({
					json: {
						sourceText: translation.source_text,
						translatedText: translation.translated_text,
						targetLanguage,
						metadata: response.metadata,
					},
				});
			});
		}

		return executionData;
	} catch (error) {
		if (error.response) {
			throw new NodeOperationError(this.getNode(), `Murf API error: ${error.response.body.message}`);
		}
		throw error;
	}
}
