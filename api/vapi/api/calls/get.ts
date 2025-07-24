// Import or declare types
import { GetCallResponse } from '@/types/vapiAi/api/calls/get';

// Function to fetch call details by ID
async function getCallById(
  callId: string,
  token: string
): Promise<GetCallResponse> {
  const url = `https://api.vapi.ai/call/${callId}`;

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error fetching call: ${error}`);
    }

    const callData: GetCallResponse = await response.json();
    return callData;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// Example usage
const token = '<your_token_here>';
getCallById('call-id-123', token)
  .then((call) => console.log('Call details:', call))
  .catch((err) => console.error('Error fetching call:', err));

// Example payload
export const exampleCallResponse: GetCallResponse = {
  id: 'call-id-123',
  orgId: 'org-id-456',
  type: 'inboundPhoneCall',
  phoneCallProvider: 'twilio',
  phoneCallTransport: 'sip',
  status: 'ended',
  endedReason: 'assistant-error',
  monitor: {
    listenUrl: 'https://example.com/listen',
    controlUrl: 'https://example.com/control'
  },
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
  destination: {
    type: 'number',
    numberE164CheckEnabled: true,
    number: '+1234567890',
    extension: '123',
    message: 'Transfer to support',
    description: 'Call transferred to support team'
  },
  createdAt: '2023-09-07T12:00:00Z',
  updatedAt: '2023-09-07T12:05:00Z',
  startedAt: '2023-09-07T12:01:00Z',
  endedAt: '2023-09-07T12:04:30Z',
  cost: 5.0,
  costBreakdown: {
    transport: 1.5,
    stt: 1.0,
    llm: 0.5,
    tts: 0.8,
    vapi: 1.2,
    total: 5.0,
    llmPromptTokens: 100,
    llmCompletionTokens: 80,
    ttsCharacters: 500
  },
  transcript: 'Transcript of the call goes here...',
  recordingUrl: 'https://example.com/recording.mp3',
  stereoRecordingUrl: 'https://example.com/stereo-recording.mp3',
  artifact: {
    videoRecordingEnabled: true,
    recordingS3PathPrefix: 's3://recordings/call-id-123'
  },
  analysis: {
    summary: 'The call ended abruptly due to an error.',
    structuredData: {},
    successEvaluation: 'unsuccessful'
  },
  assistantId: 'assistant-id-789',
  assistant: {
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en',
      smartFormat: false,
      keywords: ['support', 'account'],
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
      tools: [],
      toolIds: [],
      provider: 'anyscale',
      model: 'gpt-4',
      temperature: 0.8,
      knowledgeBase: {
        provider: 'canonical',
        topK: 5,
        fileIds: ['file-id-001']
      },
      maxTokens: 500,
      emotionRecognitionEnabled: true,
      numFastTurns: 2
    },
    voice: {
      fillerInjectionEnabled: false,
      provider: 'azure',
      voiceId: 'andrew',
      speed: 1.25,
      chunkPlan: {
        enabled: true,
        minCharacters: 30,
        punctuationBoundaries: ['.', '?', '!'],
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
    backgroundDenoisingEnabled: true
  }
};
