import type { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { basename } from 'path';

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
		let options: any = {
			method: 'POST' as IHttpRequestMethods,
			url: 'https://api.murf.ai/v1/voice-changer/convert',
			headers: {
				'api-key': credentials.apiKey,
			},
			formData: {
				voice_id: voiceId,
				format,
				channel_type: channelType,
				sample_rate: sampleRate.toString(),
				encode_output_as_base64: encodeAsBase64.toString(),
			},
		};

		// Handle file input
		if (inputType === 'file') {
			const filePath = this.getNodeParameter('file', itemIndex) as string;
			if (!filePath) {
				throw new NodeOperationError(this.getNode(), 'No file path provided!');
			}
			try {
				const fileBuffer = readFileSync(filePath);
				options.formData.file = {
					value: fileBuffer,
					options: {
						filename: basename(filePath),
					},
				};
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`Failed to read file: ${error.message}`,
				);
			}
		} else {
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
				audioFile: parsedResponse.audio_file,
				audioLengthInSeconds: parsedResponse.audio_length_in_seconds,
				remainingCharacterCount: parsedResponse.remaining_character_count,
				encodedAudio: parsedResponse.encoded_audio,
				transcription: parsedResponse.transcription,
			},
		}];

		return executionData;
	} catch (error) {
		if (error.response) {
			throw new NodeOperationError(this.getNode(), `Murf API error: ${error}`);
		}
		throw error;
	}
}
