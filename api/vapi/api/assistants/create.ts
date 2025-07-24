import fetch from 'node-fetch';

const VAPI_URL = 'https://api.vapi.ai/assistant';
const VAPI_API_KEY = '<YOUR_VAPI_API_KEY>'; // Replace with your actual API key

// Function to create an assistant
async function createAssistant(payload: CreateAssistantRequest): Promise<any> {
  const response = await fetch(VAPI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error creating assistant: ${error}`);
  }

  return await response.json();
}

// Example payload to create an assistant
export const exampleCreateAssistantPayload: CreateAssistantRequest = {
  transcriber: {
    provider: 'deepgram',
    model: 'nova-2',
    language: 'en',
    smartFormat: false,
    keywords: ['example', 'test'],
    endpointing: 255
  },
  model: {
    messages: [
      {
        content: 'Hello, how may I assist you today?',
        role: 'assistant' // Role is required here
      }
    ],
    tools: [
      {
        async: false,
        messages: [
          {
            type: 'request-start',
            content: 'Starting tool...',
            role: 'assistant', // Add the role to avoid TypeScript errors
            conditions: [
              {
                value: 'start',
                operator: 'eq',
                param: 'status'
              }
            ]
          }
        ],
        type: 'dtmf',
        function: {
          name: 'ProcessPayment',
          description: 'This function processes payments.',
          parameters: {
            type: 'object',
            properties: {},
            required: ['amount']
          }
        },
        server: {
          timeoutSeconds: 20,
          url: 'https://example.com/process-payment',
          secret: 'my-secret'
        }
      }
    ],
    toolIds: ['tool-123'],
    provider: 'anyscale',
    model: 'gpt-3',
    temperature: 1,
    knowledgeBase: {
      provider: 'canonical',
      topK: 5,
      fileIds: ['file-123']
    },
    maxTokens: 500,
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
      punctuationBoundaries: ['.', '!', '?'],
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
  backgroundDenoisingEnabled: false,
  modelOutputInMessagesEnabled: false,
  transportConfigurations: [
    {
      provider: 'twilio',
      timeout: 60,
      record: false,
      recordingChannels: 'mono'
    }
  ],
  name: 'Test Assistant',
  firstMessage: 'Hello! How can I assist you today?',
  voicemailDetection: {
    provider: 'twilio',
    voicemailDetectionTypes: ['machine_end_beep'],
    enabled: true,
    machineDetectionTimeout: 31,
    machineDetectionSpeechThreshold: 3500,
    machineDetectionSpeechEndThreshold: 2750,
    machineDetectionSilenceTimeout: 6000
  },
  voicemailMessage: 'Please leave a message after the beep.',
  endCallMessage: 'Thank you for calling, goodbye!',
  endCallPhrases: ['goodbye', 'bye'],
  metadata: {},
  serverUrl: 'https://example.com/server-url',
  serverUrlSecret: 'my-server-secret',
  analysisPlan: {
    summaryPrompt: 'Summarize the conversation.',
    summaryRequestTimeoutSeconds: 10,
    structuredDataRequestTimeoutSeconds: 10,
    successEvaluationPrompt: 'Was this successful?',
    successEvaluationRubric: 'NumericScale',
    successEvaluationRequestTimeoutSeconds: 10,
    structuredDataPrompt: 'Provide structured data.',
    structuredDataSchema: {
      type: 'string',
      items: {},
      properties: {},
      description: 'Schema description',
      required: ['requiredField']
    }
  },
  artifactPlan: {
    videoRecordingEnabled: true,
    recordingS3PathPrefix: 's3://my-recordings/'
  },
  messagePlan: {
    idleMessages: ['Please hold.'],
    idleMessageMaxSpokenCount: 5,
    idleTimeoutSeconds: 20
  },
  startSpeakingPlan: {
    waitSeconds: 0.4,
    smartEndpointingEnabled: false,
    transcriptionEndpointingPlan: {
      onPunctuationSeconds: 0.1,
      onNoPunctuationSeconds: 1.5,
      onNumberSeconds: 0.5
    }
  },
  stopSpeakingPlan: {
    numWords: 0,
    voiceSeconds: 0.2,
    backoffSeconds: 1
  },
  credentialIds: ['credential-123']
};

// // Call the function to create the assistant
// createAssistant(exampleCreateAssistantPayload)
//   .then((response) => console.log('Assistant Created:', response))
//   .catch((error) => console.error('Error:', error));
