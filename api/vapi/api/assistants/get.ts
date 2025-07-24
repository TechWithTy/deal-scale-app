import { AssistantResponse } from '@/types/vapiAi/api/assistant/get';

// Function to get an assistant by ID
async function getAssistantById(
  assistantId: string
): Promise<AssistantResponse> {
  const VAPI_URL = `https://api.vapi.ai/assistant/${assistantId}`;
  const VAPI_API_KEY = '<YOUR_VAPI_API_KEY>'; // Replace with your actual API key

  const response = await fetch(VAPI_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error fetching assistant: ${error}`);
  }

  const assistant: AssistantResponse = await response.json();
  return assistant;
}

// Example usage
getAssistantById('assistant-id-123')
  .then((assistant) => console.log('Assistant fetched:', assistant))
  .catch((error) => console.error('Error:', error));

export const exampleGetResponseData = {
  id: 'assistant-id-123',
  name: 'Customer Support Assistant',
  status: 'active',
  createdAt: '2023-01-01T12:00:00Z',
  updatedAt: '2023-09-01T15:00:00Z',
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
  maxDurationSeconds: 3600,
  assistantOverrides: {
    model: {
      temperature: 0.7,
      maxTokens: 512
    }
  }
};
