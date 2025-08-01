import type { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createReadStream } from 'fs';
import { basename } from 'path';
import FormData from 'form-data';

export async function executeVoiceChanger(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const inputType = this.getNodeParameter('inputType', itemIndex) as string;
	const voiceId = this.getNodeParameter('voiceId', itemIndex) as string;
	const format = this.getNodeParameter('format', itemIndex) as string;
	const channelType = this.getNodeParameter('channelType', itemIndex) as string;
	const sampleRate = this.getNodeParameter('sampleRate', itemIndex) as number;
	const encodeAsBase64 = this.getNodeParameter('encodeAsBase64', itemIndex) as boolean;

	const credentials = await this.getCredentials('murfApi');
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

	try {
		const formData = new FormData();
		formData.append('voice_id', voiceId);

		// Handle file input
		if (inputType === 'file') {
			const filePath = this.getNodeParameter('file', itemIndex) as string;
			if (!filePath) {
				throw new NodeOperationError(this.getNode(), 'No file path provided!');
			}
			formData.append('file', createReadStream(filePath), basename(filePath));
		} else {
			const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
			if (!fileUrl) {
				throw new NodeOperationError(this.getNode(), 'No file URL provided!');
			}
			formData.append('file_url', fileUrl);
		}

		// Add parameters
		formData.append('format', format);
		formData.append('channel_type', channelType);
		formData.append('sample_rate', sampleRate.toString());
		formData.append('encode_as_base64', encodeAsBase64.toString());

		const options = {
			method: 'POST' as IHttpRequestMethods,
			url: 'https://api.murf.ai/v1/voice-changer/convert',
			headers: {
				'api-key': credentials.apiKey,
				...formData.getHeaders(),
			},
			formData,
			json: true,
		};


		const response = await this.helpers.request(options);

		const executionData: INodeExecutionData[] = [{
			json: {
				audioFile: response.audio_file,
				audioLengthInSeconds: response.audio_length_in_seconds,
				remainingCharacterCount: response.remaining_character_count,
				encodedAudio: response.encoded_audio,
				transcription: response.transcription,
			},
		}];

		return executionData;
	} catch (error) {
		if (error.response) {
			throw new NodeOperationError(this.getNode(), `Murf API error: ${error.response.body.message}`);
		}
		throw error;
	}
}
