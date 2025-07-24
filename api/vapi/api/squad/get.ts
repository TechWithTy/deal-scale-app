import { GetSquadResponse } from '@/types/vapiAi/api/squad/get';

// Function to fetch a squad by ID
async function getSquadById(
  squadId: string,
  token: string
): Promise<GetSquadResponse> {
  const url = `https://api.vapi.ai/squad/${squadId}`;

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
      const errorText = await response.text();
      throw new Error(`Error fetching squad: ${errorText}`);
    }

    const squadData: GetSquadResponse = await response.json(); // Cast response to GetSquadResponse type
    return squadData;
  } catch (error) {
    console.error('Error fetching squad:', error);
    throw error;
  }
}

// Example usage:
const token = '<YOUR_API_TOKEN>';
const squadId = 'squad-id-123';

getSquadById(squadId, token)
  .then((squad) => console.log('Squad details:', squad))
  .catch((error) => console.error('Error:', error));

export const exampleGetSquateResponse = {
  id: 'squad-id-123',
  name: 'Support Team',
  members: [
    {
      assistantId: 'assistant-id-001',
      name: 'Support Assistant'
    }
  ],
  createdAt: '2023-09-07T12:00:00Z',
  updatedAt: '2023-09-07T12:30:00Z'
};
