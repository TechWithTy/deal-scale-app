// api/squads.ts
import {
  UpdateSquadRequest,
  UpdateSquadResponse
} from '@/types/vapiAi/api/squad/update';

// Function to update a squad by ID
export async function updateSquad(
  squadId: string, // ID of the squad to update
  token: string, // API token for authorization
  updateData: UpdateSquadRequest // Data for the update
): Promise<UpdateSquadResponse> {
  const url = `https://api.vapi.ai/squad/${squadId}`;

  const options = {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData) // Send the updated squad data
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error updating squad: ${errorText}`);
    }

    const updatedSquad: UpdateSquadResponse = await response.json();
    return updatedSquad;
  } catch (error) {
    console.error('Failed to update squad:', error);
    throw error;
  }
}

// Example usage
const token = '<your_api_token_here>';
const squadId = 'squad-id-123'; // The ID of the squad to update

const updateData: UpdateSquadRequest = {
  name: 'New Squad Name',
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
          messages: [{ content: 'Welcome to the call.', role: 'assistant' }],
          provider: 'anyscale',
          temperature: 0.7
        },
        voice: {
          provider: 'azure',
          voiceId: 'andrew',
          speed: 1.25
        }
      },
      assistantOverrides: {
        voice: {
          speed: 1.1
        }
      }
    }
  ],
  membersOverrides: {
    assistant: {
      transcriber: { provider: 'deepgram', model: 'nova-2' }
    }
  }
};

updateSquad(squadId, token, updateData)
  .then((updatedSquad) => console.log('Updated Squad:', updatedSquad))
  .catch((error) => console.error('Error updating squad:', error));

// Example response after successful update
export const exampleUpdateSquadResponse: UpdateSquadResponse = {
  id: 'squad-id-123',
  name: 'New Squad Name',
  members: [
    {
      assistantId: 'assistant-id-001',
      assistant: {
        transcriber: { provider: 'deepgram', model: 'nova-2', language: 'en' },
        model: {
          messages: [{ content: 'Welcome to the call.', role: 'assistant' }],
          provider: 'anyscale',
          temperature: 0.7
        },
        voice: { provider: 'azure', voiceId: 'andrew', speed: 1.25 }
      },
      assistantOverrides: {
        voice: { speed: 1.1 }
      }
    }
  ],
  membersOverrides: {
    assistant: {
      transcriber: { provider: 'deepgram', model: 'nova-2' }
    }
  },
  orgId: 'org-id-001',
  createdAt: '2023-09-07T12:00:00Z',
  updatedAt: '2023-09-07T12:30:00Z'
};
