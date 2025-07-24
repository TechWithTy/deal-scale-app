import {
  UpdateCallRequestBody,
  UpdateCallResponse
} from '@/types/vapiAi/api/calls/update';

// Function to update the call by ID
async function updateCall(
  callId: string,
  token: string,
  requestBody: UpdateCallRequestBody
): Promise<UpdateCallResponse> {
  const url = `https://api.vapi.ai/call/${callId}`;

  const options = {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error updating call: ${error}`);
    }

    const updatedCallData: UpdateCallResponse = await response.json();
    return updatedCallData;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// Example usage
const token = '<your_token_here>';
const callId = 'call-id-123'; // The ID of the call to update
const requestBody: UpdateCallRequestBody = {
  name: 'Updated Call Name' // Updating the name of the call
};

updateCall(callId, token, requestBody)
  .then((updatedCall) => console.log('Updated call:', updatedCall))
  .catch((err) => console.error('Error updating call:', err));

export const exampleUpdateCallResponse = {
  id: 'call-id-123',
  orgId: 'org-id-456',
  type: 'outboundPhoneCall',
  messages: [
    {
      content: 'Hello, how can I help you?',
      role: 'assistant'
    },
    {
      content: 'I need help with my account.',
      role: 'user'
    }
  ],
  status: 'ended',
  endedReason: 'assistant-ended-call',
  createdAt: '2023-09-07T12:00:00Z',
  updatedAt: '2023-09-07T12:05:00Z',
  startedAt: '2023-09-07T12:01:00Z',
  endedAt: '2023-09-07T12:04:30Z',
  cost: 5.0,
  transcript: 'Transcript of the call goes here...',
  recordingUrl: 'https://example.com/recording.mp3',
  assistantId: 'assistant-id-001'
};
