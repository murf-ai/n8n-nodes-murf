# n8n-nodes-murf

This is an n8n community node for [Murf AI](https://murf.ai). It provides integration with Murf's AI-powered voice and audio processing services.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Resources](#resources)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
npm install n8n-nodes-murf
```

## Operations

The Murf AI node provides the following operations:

### Text to Speech
- **Generate Speech**: Convert text to natural-sounding speech using AI voices
  - Supports multiple languages and voice styles
  - Control speech parameters like speed, pitch, and emphasis
  - Add pauses and customize pronunciation

### Voice Changer
- **Convert Voice**: Transform audio files by changing voice characteristics
  - Modify voice properties while maintaining natural sound
  - Support for various audio formats

### Translation
- **Translate**: Translate text between supported languages
  - High-quality translations optimized for voice synthesis
  - Preserve formatting and special characters

### Dubbing
- **Create Dubbing Job**: Create automated dubbing jobs for videos
  - Support for multiple target languages
  - File or URL input options
  - Optional project creation for Murf UI editing
  - Priority levels for processing
  - Webhook support for status updates
- **Check Job Status**: Monitor the progress of dubbing jobs
  - Get detailed status information
  - Access download URLs for completed jobs
  - View credit usage and remaining credits

## Node Structure

```
nodes/Murf/
├── Dubbing/
│   ├── DubbingDescription.ts   # Dubbing node parameters
│   └── DubbingExecute.ts       # Dubbing operations logic
├── TextToSpeech/
│   └── ...                     # Text to Speech components
├── VoiceChanger/
│   └── ...                     # Voice Changer components
├── Translations/
│   └── ...                     # Translation components
├── Murf.node.ts               # Main node definition
└── Murf.node.json             # Node metadata
```

## Credentials

The node requires API credentials from Murf AI:

1. **Murf API** (`murfApi`)
   - Required for Text to Speech, Voice Changer, and Translation operations
   - Get your API key from [Murf API Dashboard](https://murf.ai/api/dashboard)

2. **Murf Dubbing API** (`murfDubApi`)
   - Required for Dubbing operations
   - Get your Dubbing API key from [Murf Dub Dashboard](https://dub.murf.ai)

## Compatibility

- Requires n8n version 1.0.0 or later
- Follows n8n community node standards

## Usage

1. Install the node package
2. Add your Murf AI credentials in n8n
3. Add the Murf AI node to your workflow
4. Configure the desired operation and parameters
5. Connect with other nodes as needed

## Resources

- [Murf AI API Documentation](https://murf.ai/api/docs)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Report Issues](https://github.com/murf-ai/n8n-nodes-murf)

## Development

To develop the node:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Link to n8n: `npm link`
5. Start n8n: `n8n start`

## License

[MIT](LICENSE.md)
