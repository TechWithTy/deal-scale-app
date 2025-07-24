import fetch from 'node-fetch';
import { ListAssistantsResponse } from '@/types/vapiAi/api/assistant/list';

// Function to list assistants with optional query parameters
async function listAssistants(
  limit: number = 100, // Default limit
  createdAtGt?: string, // Optional: created after this date
  createdAtLt?: string, // Optional: created before this date
  updatedAtGt?: string, // Optional: updated after this date
  updatedAtLt?: string // Optional: updated before this date
): Promise<ListAssistantsResponse> {
  const VAPI_URL = 'https://api.vapi.ai/assistant';
  const VAPI_API_KEY = '<YOUR_VAPI_API_KEY>'; // Replace with your actual API key

  // Construct query parameters
  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  if (createdAtGt) queryParams.append('createdAtGt', createdAtGt);
  if (createdAtLt) queryParams.append('createdAtLt', createdAtLt);
  if (updatedAtGt) queryParams.append('updatedAtGt', updatedAtGt);
  if (updatedAtLt) queryParams.append('updatedAtLt', updatedAtLt);

  const response = await fetch(`${VAPI_URL}?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error listing assistants: ${error}`);
  }

  // Cast the result of json() to ListAssistantsResponse
  const assistantsList = (await response.json()) as ListAssistantsResponse;

  return assistantsList;
}

// Example usage
listAssistants(50, '2023-01-01T00:00:00Z', undefined, '2023-12-31T23:59:59Z')
  .then((response) => console.log('Assistants:', response))
  .catch((error) => console.error('Error:', error));

export const exampleListAssistantsResponse = {
  assistants: [
    {
      id: 'assistant-id-001',
      name: 'Customer Support Assistant',
      status: 'active',
      createdAt: '2023-01-01T12:00:00Z',
      updatedAt: '2023-06-01T15:00:00Z',
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en',
        smartFormat: true,
        keywords: ['support', 'account'],
        endpointing: 250
      },
      model: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.8,
        maxTokens: 1024,
        emotionRecognitionEnabled: true,
        numFastTurns: 2
      },
      voice: {
        provider: 'azure',
        voiceId: 'andrew',
        speed: 1.25,
        fillerInjectionEnabled: false
      },
      firstMessageMode: 'assistant-speaks-first',
      recordingEnabled: true,
      hipaaEnabled: false,
      backgroundSound: 'office',
      backchannelingEnabled: false,
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 3600
    },
    {
      id: 'assistant-id-002',
      name: 'Technical Support Bot',
      status: 'inactive',
      createdAt: '2023-02-15T12:00:00Z',
      updatedAt: '2023-07-01T15:00:00Z',
      transcriber: {
        provider: 'azure',
        model: 'neural-en',
        language: 'en',
        smartFormat: false,
        keywords: ['error', 'bug'],
        endpointing: 200
      },
      model: {
        provider: 'azure',
        model: 'gpt-3',
        temperature: 0.7,
        maxTokens: 800,
        emotionRecognitionEnabled: false,
        numFastTurns: 1
      },
      voice: {
        provider: 'google',
        voiceId: 'samantha',
        speed: 1.0,
        fillerInjectionEnabled: true
      },
      firstMessageMode: 'assistant-waits-for-user',
      recordingEnabled: false,
      hipaaEnabled: true,
      backgroundSound: 'off',
      backchannelingEnabled: true,
      silenceTimeoutSeconds: 60,
      maxDurationSeconds: 1800
    }
    // More assistant objects...
  ],
  totalCount: 2
};
