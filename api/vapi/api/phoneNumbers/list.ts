import { PhoneNumberProvider } from '@/types/vapiAi/api/phoneNumbers/create';
import { ListPhoneNumbersResponse } from '@/types/vapiAi/api/phoneNumbers/list';
import fetch from 'node-fetch'; // Or node-fetch v3 or axios if preferred

// Function to list phone numbers with optional query parameters
async function listPhoneNumbers(
  token: string,
  limit: number = 100,
  createdAtGt?: string,
  createdAtLt?: string,
  updatedAtGt?: string,
  updatedAtLt?: string
): Promise<ListPhoneNumbersResponse> {
  const url = new URL('https://api.vapi.ai/phone-number');

  // Add query parameters if provided
  url.searchParams.append('limit', limit.toString());
  if (createdAtGt) url.searchParams.append('createdAtGt', createdAtGt);
  if (createdAtLt) url.searchParams.append('createdAtLt', createdAtLt);
  if (updatedAtGt) url.searchParams.append('updatedAtGt', updatedAtGt);
  if (updatedAtLt) url.searchParams.append('updatedAtLt', updatedAtLt);

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error listing phone numbers: ${errorText}`);
    }

    // Cast the response to ListPhoneNumbersResponse
    const responseData = (await response.json()) as ListPhoneNumbersResponse;
    return responseData;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// Example usage
const token = '<your_token_here>';
listPhoneNumbers(
  token,
  50,
  '2023-01-01T00:00:00Z',
  undefined,
  '2023-12-31T23:59:59Z'
)
  .then((response) => console.log('Phone Numbers:', response))
  .catch((error) => console.error('Error:', error));

export const exampleListPhoneNumbersResponse: ListPhoneNumbersResponse = [
  {
    fallbackDestination: {
      type: 'number',
      numberE164CheckEnabled: true,
      number: '+14155551234',
      extension: '1234',
      message: 'Fallback message',
      description: 'Fallback description'
    },
    provider: PhoneNumberProvider.ByoPhoneNumber, // Correct
    numberE164CheckEnabled: true,
    id: 'phone-number-123',
    orgId: 'org-123',
    createdAt: '2023-11-07T05:31:56Z',
    updatedAt: '2023-11-07T05:31:56Z',
    name: 'Test Phone Number',
    assistantId: 'assistant-123',
    squadId: 'squad-123',
    serverUrl: 'https://my-server-url.com',
    serverUrlSecret: 'my-server-secret',
    number: '+14155551234',
    credentialId: 'credential-123'
  },
  {
    fallbackDestination: {
      type: 'number',
      numberE164CheckEnabled: true,
      number: '+14155554321',
      extension: '5678',
      message: 'Fallback message',
      description: 'Fallback description'
    },
    provider: PhoneNumberProvider.ByoPhoneNumber, // Correct
    numberE164CheckEnabled: true,
    id: 'phone-number-456',
    orgId: 'org-123',
    createdAt: '2023-11-06T12:00:00Z',
    updatedAt: '2023-11-06T12:30:00Z',
    name: 'Secondary Phone Number',
    assistantId: 'assistant-456',
    squadId: 'squad-456',
    serverUrl: 'https://my-other-server-url.com',
    serverUrlSecret: 'my-other-server-secret',
    number: '+14155554321',
    credentialId: 'credential-456'
  }
];
