// api/squads.ts

import {
  ListSquadsQueryParams,
  ListSquadsResponse
} from '@/types/vapiAi/api/squad/list'; // Ensure correct path

// Function to list squads with optional query parameters
export async function listSquads(
  token: string, // API token for authorization
  queryParams: ListSquadsQueryParams = {} // Optional query parameters
): Promise<ListSquadsResponse> {
  const baseUrl = 'https://api.vapi.ai/squad';

  // Construct query string from queryParams object
  const queryString = new URLSearchParams(
    queryParams as Record<string, string>
  ).toString();
  const url = `${baseUrl}?${queryString}`;

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
      throw new Error(`Error fetching squads: ${response.statusText}`);
    }

    // Cast the response to ListSquadsResponse
    const data: ListSquadsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch squads:', error);
    throw error;
  }
}

// Example usage:
const token = '<your_api_token_here>';
listSquads(token, { limit: 50, createdAtGt: '2023-01-01T00:00:00Z' })
  .then((squads) => console.log('Squads:', squads))
  .catch((error) => console.error('Error:', error));

// Example response
export const exampleListSquadsResponse: ListSquadsResponse = {
  squads: [
    {
      id: 'squad-001',
      name: 'Support Squad',
      members: [
        {
          assistantId: 'assistant-001',
          assistant: { transcriber: { provider: 'deepgram', model: 'nova' } }
        }
      ],
      createdAt: '2023-09-07T12:00:00Z',
      updatedAt: '2023-09-07T12:10:00Z',
      membersOverrides: {
        assistant: { voice: { provider: 'azure', voiceId: 'andrew' } }
      }
    }
  ]
};
