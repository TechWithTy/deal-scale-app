// api/squads.ts
import { DeleteSquadResponse } from '@/types/vapiAi/api/squad/delete';

// Function to delete a squad by ID
export async function deleteSquadById(
  squadId: string,
  token: string
): Promise<DeleteSquadResponse> {
  const url = `https://api.vapi.ai/squad/${squadId}`;

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
      const errorText = await response.text();
      throw new Error(`Error deleting squad: ${errorText}`);
    }

    // Cast the response to DeleteSquadResponse type
    const responseData: DeleteSquadResponse = await response.json();
    return responseData;
  } catch (error) {
    console.error('Failed to delete squad:', error);
    throw error;
  }
}

// Example usage
const token = '<your_api_token_here>';
const squadId = 'squad-id-123'; // The ID of the squad to delete

deleteSquadById(squadId, token)
  .then((response) => console.log('Deleted Squad:', response))
  .catch((error) => console.error('Error deleting squad:', error));

export const exampleDeleteSquadResponse: DeleteSquadResponse = {
  id: 'squad-id-123',
  name: 'Example Squad',
  members: [
    {
      assistantId: 'assistant-id-001',
      assistant: {
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        },
        model: {
          messages: [
            { content: 'Hello, how can I help you?', role: 'assistant' }
          ],
          provider: 'anyscale',
          temperature: 0.7
        }
      }
    }
  ],
  membersOverrides: {
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2'
    }
  },
  orgId: 'org-id-001',
  createdAt: '2023-09-07T12:00:00Z',
  updatedAt: '2023-09-07T12:30:00Z'
};
