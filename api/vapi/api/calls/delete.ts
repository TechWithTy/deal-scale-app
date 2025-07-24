// Import necessary types
import { DeleteCallResponse } from '@/types/vapiAi/api/calls/delete';

// Function to delete a call by ID
async function deleteCallById(
  callId: string,
  token: string
): Promise<DeleteCallResponse> {
  const url = `https://api.vapi.ai/call/${callId}`;

  const options = {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error deleting call: ${error}`);
    }

    const deleteCallData: DeleteCallResponse = await response.json();
    return deleteCallData;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// Example usage
const token = '<your_token_here>';
const callId = 'call-id-123';

deleteCallById(callId, token)
  .then((deletedCall) => console.log('Deleted Call:', deletedCall))
  .catch((err) => console.error('Error deleting call:', err));

export const exampleDeleteResponse = {
  id: 'call-id-123',
  status: 'ended',
  endedReason: 'manually-canceled',
  type: 'inboundPhoneCall',
  phoneCallProvider: 'twilio',
  messages: [],
  createdAt: '2023-09-07T12:00:00Z',
  updatedAt: '2023-09-07T12:30:00Z'
};
