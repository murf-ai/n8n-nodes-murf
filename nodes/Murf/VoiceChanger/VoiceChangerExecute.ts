import type { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export async function executeVoiceChanger(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const inputType = this.getNodeParameter('inputType', itemIndex) as string;


	const voiceIdParam = this.getNodeParameter('voiceId', itemIndex) as any;
	let voiceId: string;
	if (typeof voiceIdParam === 'object' && voiceIdParam.value) {
		voiceId = voiceIdParam.value;
	} else if (typeof voiceIdParam === 'string') {
		voiceId = voiceIdParam;
	} else {
		throw new NodeOperationError(this.getNode(), 'Invalid voice ID parameter - please select a valid voice');
	}
	const credentials = await this.getCredentials('murfApi') as any;
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}
	const format = this.getNodeParameter('format', itemIndex) as string;
	const channelType = this.getNodeParameter('channelType', itemIndex) as string;
	const sampleRate = this.getNodeParameter('sampleRate', itemIndex) as number;
	const encodeAsBase64 = this.getNodeParameter('encodeAsBase64', itemIndex) as boolean;
	const formdata = new FormData();
	formdata.append('voice_id', voiceId);
	formdata.append('format', format);
	formdata.append('channel_type', channelType);
	formdata.append('sample_rate', sampleRate.toString());
	formdata.append('encode_output_as_base64', encodeAsBase64.toString());

	if (inputType === 'file') {
		const binaryPropertyName = this.getNodeParameter('file', itemIndex) as string;
		const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);

		const fileBuffer = Buffer.from(binaryData.data, 'base64');
		formdata.append('file', new Blob([fileBuffer]), binaryData.fileName);
	}
	else if (inputType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
		formdata.append('file_url', fileUrl);
	}


	const requestOptions: any = {
		method: 'POST' as IHttpRequestMethods,
		url: 'https://api.murf.ai/v1/voice-changer/convert',
		headers: {
			'api-key': credentials.apiKey,
		},
		body: formdata,
	};

	try {
		const response = await this.helpers.httpRequest(requestOptions);
		const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;

		const executionData: INodeExecutionData[] = [{
			json: {
				audioFile: parsedResponse.audio_file,
				audioLengthInSeconds: parsedResponse.audio_length_in_seconds,
				remainingCharacterCount: parsedResponse.remaining_character_count,
				encodedAudio: parsedResponse.encoded_audio,
				transcription: parsedResponse.transcription,
			},
			binary: parsedResponse.encoded_audio
				? {
						data: {
							data: parsedResponse.encoded_audio,
							mimeType: `audio/${format.toLowerCase()}`,
							fileName: `murf_voice_changed.${format.toLowerCase()}`,
							fileExtension: format.toLowerCase(),
							fileLength: parsedResponse?.audio_length_in_seconds,
						},
					}
				: undefined,
		}];

		return executionData;
	} catch (error) {
		if (error.response) {
			throw new NodeOperationError(this.getNode(), `Murf API error: ${error}`);
		}
		throw error;
	}
}
