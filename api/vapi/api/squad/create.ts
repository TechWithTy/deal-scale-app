import { ToolMessageType, MessageRole } from '@/types/vapiAi/api/calls/create';
import { CreateSquadRequest } from '@/types/vapiAi/api/squad/create';

async function createSquad(
  apiUrl: string,
  apiKey: string,
  squadData: CreateSquadRequest
) {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(squadData)
  };

  try {
    const response = await fetch(apiUrl, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error creating squad: ${error}`);
    }

    const createdSquad = await response.json();
    console.log('Squad created successfully:', createdSquad);
    return createdSquad;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Example usage
const apiUrl = 'https://api.vapi.ai/squad';
const apiKey = '<YOUR_API_KEY>'; // Replace with actual API key

const squadData: CreateSquadRequest = {
  name: 'My Squad',
  members: [
    {
      assistantId: 'assistant-123',
      assistant: {
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en',
          smartFormat: false,
          keywords: ['support', 'help'],
          endpointing: 255
        },
        model: {
          messages: [
            { content: 'Hello, how can I assist you?', role: 'assistant' }
          ],
          tools: [
            {
              async: false,
              messages: [
                {
                  type: ToolMessageType.ToolMessageStart,
                  content: 'Processing your request, please wait...',
                  role: MessageRole.Assistant
                }
              ],
              type: 'dtmf',
              function: {
                name: 'DTMF Tool',
                description: 'Tool for DTMF detection',
                parameters: {
                  type: 'object',
                  properties: {},
                  required: ['param1']
                }
              },
              server: {
                timeoutSeconds: 20,
                url: 'https://my-tool-url.com',
                secret: 'mySecretKey'
              }
            }
          ],
          toolIds: ['tool-1'],
          provider: 'anyscale',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000,
          emotionRecognitionEnabled: true,
          numFastTurns: 1
        },
        voice: {
          provider: 'azure',
          voiceId: 'en-US-GuyNeural',
          speed: 1.2,
          chunkPlan: {
            enabled: true,
            minCharacters: 30,
            punctuationBoundaries: ['.', ',', '?', '!', ';'],
            formatPlan: { enabled: true, numberToDigitsCutoff: 2025 }
          }
        },
        firstMessageMode: 'assistant-speaks-first',
        recordingEnabled: true,
        hipaaEnabled: false,
        clientMessages: ['conversation-update', 'function-call', 'transcript'],
        serverMessages: ['conversation-update', 'end-of-call-report'],
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 600,
        backgroundSound: 'office',
        backchannelingEnabled: false,
        backgroundDenoisingEnabled: true,
        modelOutputInMessagesEnabled: false,
        transportConfigurations: [
          {
            provider: 'twilio',
            timeout: 60,
            record: false,
            recordingChannels: 'mono'
          }
        ],
        voicemailDetection: {
          provider: 'twilio',
          voicemailDetectionTypes: ['machine_end_beep', 'machine_end_silence'],
          enabled: true,
          machineDetectionTimeout: 30, // Timeout in seconds
          machineDetectionSpeechThreshold: 3000, // Threshold in milliseconds
          machineDetectionSpeechEndThreshold: 2500, // Added this field
          machineDetectionSilenceTimeout: 5000 // Timeout in milliseconds
        },
        voicemailMessage:
          'You have reached our voicemail, please leave a message after the beep.',
        endCallMessage: 'Thank you for calling. Goodbye!',
        endCallPhrases: ['Goodbye', 'Take care'],
        serverUrl: 'https://my-server-url.com',
        serverUrlSecret: 'serverSecret',
        analysisPlan: {
          summaryPrompt: 'Summarize the call in a few sentences.',
          successEvaluationPrompt: 'Did the call meet the customer’s needs?',
          successEvaluationRubric: 'NumericScale', // Could also be 'PassFail'
          summaryRequestTimeoutSeconds: 10, // Timeout for summary request
          structuredDataRequestTimeoutSeconds: 10, // Timeout for structured data request
          successEvaluationRequestTimeoutSeconds: 10, // Timeout for success evaluation request
          structuredDataPrompt: 'Provide structured data from the call.', // Missing structured data prompt
          structuredDataSchema: {
            type: 'object',
            properties: {}, // Define the properties for structured data here
            required: ['field1'] // Example required fields
          }
        },
        artifactPlan: {
          videoRecordingEnabled: true,
          recordingS3PathPrefix: 's3://my-bucket/recordings/'
        },
        messagePlan: {
          idleMessages: ['Are you still there?'],
          idleMessageMaxSpokenCount: 3,
          idleTimeoutSeconds: 20
        },
        startSpeakingPlan: {
          waitSeconds: 1,
          smartEndpointingEnabled: true,
          transcriptionEndpointingPlan: {
            onPunctuationSeconds: 0.1,
            onNoPunctuationSeconds: 1.5,
            onNumberSeconds: 0.5
          }
        },
        stopSpeakingPlan: { numWords: 50, voiceSeconds: 1, backoffSeconds: 1 },
        credentialIds: ['credential-1']
      }
    }
  ],
  membersOverrides: {
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'bg',
      smartFormat: true,
      keywords: ['override'],
      endpointing: 300
    }
  }
};

// Create the squad
createSquad(apiUrl, apiKey, squadData)
  .then((response) => console.log('Squad Response:', response))
  .catch((error) => console.error('Error:', error));
