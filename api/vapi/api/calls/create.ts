import {
  CreateCallRequest,
  MessageRole,
  ToolMessageType
} from '@/types/vapiAi/api/calls/create';

// API call to create a call
async function createCall(
  apiUrl: string,
  apiKey: string,
  callRequestData: CreateCallRequest
) {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(callRequestData)
  };

  try {
    const response = await fetch(apiUrl, options);

    if (!response.ok) {
      // Handle non-200 responses
      const errorText = await response.text();
      throw new Error(`Error creating call: ${errorText}`);
    }

    // Parse the JSON response
    const responseData = await response.json();
    console.log('Call created successfully:', responseData);

    return responseData; // Return the response data if needed
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error if needed for further handling
  }
}

// Example usage of the createCall function
const apiUrl = 'https://api.vapi.ai/call';
const apiKey = '<YOUR_VAPI_API_KEY>'; // Replace with your actual API key

const callRequestData: CreateCallRequest = {
  name: 'Test Call',
  assistantId: 'assistant-123',
  assistant: {
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'bg',
      smartFormat: false,
      keywords: ['test'],
      endpointing: 255
    },
    model: {
      messages: [
        {
          role: 'user',
          message: 'Hello, how can I help?',
          time: Date.now(),
          secondsFromStart: 5,
          endTime: Date.now() + 1000,
          duration: 1
        }
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
            url: 'https://tool.server.url',
            secret: 'secretKey'
          }
        }
      ],
      toolIds: ['tool-1'],
      provider: 'anyscale',
      model: 'model-1',
      temperature: 1,
      maxTokens: 525,
      emotionRecognitionEnabled: true,
      numFastTurns: 1
    },
    voice: {
      fillerInjectionEnabled: false,
      provider: 'azure',
      voiceId: 'andrew',
      speed: 1.25,
      chunkPlan: {
        enabled: true,
        minCharacters: 30,
        punctuationBoundaries: ['.', ',', '!', '?'],
        formatPlan: {
          enabled: true,
          numberToDigitsCutoff: 2025
        }
      }
    },
    firstMessageMode: 'assistant-speaks-first',
    recordingEnabled: true,
    hipaaEnabled: false,
    clientMessages: ['conversation-update', 'function-call'],
    serverMessages: ['conversation-update', 'end-of-call-report'],
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600,
    backgroundSound: 'office',
    backchannelingEnabled: false,
    backgroundDenoisingEnabled: false
  },
  phoneNumberId: 'phone-number-123',
  customerId: 'customer-123'
};

// Call the function
createCall(apiUrl, apiKey, callRequestData)
  .then((response) => console.log('Call Response:', response))
  .catch((error) => console.error('Call Error:', error));

export const exampleCreateCallResponse = {
  id: 'call-id-001', // Unique identifier for the call
  name: 'Test Call',
  assistantId: 'assistant-123',
  squadId: null,
  phoneNumberId: 'phone-number-123',
  customerId: 'customer-123',
  status: 'queued', // Initial status of the call
  endedReason: null, // Not ended yet
  type: 'outboundPhoneCall',
  phoneCallProvider: 'twilio',
  phoneCallTransport: 'pstn',
  createdAt: '2024-09-08T12:00:00Z',
  updatedAt: '2024-09-08T12:01:00Z',
  startedAt: null, // Call hasn't started yet
  endedAt: null, // Call hasn't ended yet
  cost: 0.0, // Cost will be calculated after the call
  messages: [
    {
      content: 'Hello!',
      role: 'assistant' // Initial assistant message
    }
  ],
  recordingUrl: null, // Recording will be available after the call
  stereoRecordingUrl: null,
  transcript: null, // Transcript will be generated after the call
  artifact: {
    videoRecordingEnabled: true,
    recordingS3PathPrefix: 's3://recordings/call-id-001'
  },
  analysis: {
    summary: null,
    structuredData: {},
    successEvaluation: null
  },
  assistant: {
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'bg',
      smartFormat: false,
      keywords: ['test'],
      endpointing: 255
    },
    model: {
      messages: [{ content: 'Hello!', role: 'assistant' }],
      tools: [
        {
          async: false,
          messages: [
            {
              type: 'request-start',
              content: 'Tool started',
              role: 'assistant',
              conditions: [{ value: 'start', operator: 'eq', param: 'trigger' }]
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
            url: 'https://tool.server.url',
            secret: 'secretKey'
          }
        }
      ],
      toolIds: ['tool-1'],
      provider: 'anyscale',
      model: 'model-1',
      temperature: 1,
      maxTokens: 525,
      emotionRecognitionEnabled: true,
      numFastTurns: 1
    },
    voice: {
      fillerInjectionEnabled: false,
      provider: 'azure',
      voiceId: 'andrew',
      speed: 1.25,
      chunkPlan: {
        enabled: true,
        minCharacters: 30,
        punctuationBoundaries: ['.', ',', '!', '?'],
        formatPlan: {
          enabled: true,
          numberToDigitsCutoff: 2025
        }
      }
    },
    firstMessageMode: 'assistant-speaks-first',
    recordingEnabled: true,
    hipaaEnabled: false,
    clientMessages: ['conversation-update', 'function-call'],
    serverMessages: ['conversation-update', 'end-of-call-report'],
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600,
    backgroundSound: 'office',
    backchannelingEnabled: false,
    backgroundDenoisingEnabled: false
  }
};
