import { PhoneNumberProvider } from '@/types/vapiAi/api/phoneNumbers/create';
import { GetPhoneNumberResponse } from '@/types/vapiAi/api/phoneNumbers/get';
import fetch from 'node-fetch';

// Function to fetch phone number details by ID
async function getPhoneNumberById(
  phoneNumberId: string,
  token: string
): Promise<GetPhoneNumberResponse> {
  const url = `https://api.vapi.ai/phone-number/${phoneNumberId}`;

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
      throw new Error(`Error fetching phone number: ${errorText}`);
    }

    const responseData = (await response.json()) as GetPhoneNumberResponse; // Type casting here
    return responseData;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// Example usage
const token = '<your_token_here>';
getPhoneNumberById('phone-number-id-123', token)
  .then((phoneNumber) => console.log('Phone Number:', phoneNumber))
  .catch((error) => console.error('Error:', error));

export const exampleGetPhoneNumberResponse: GetPhoneNumberResponse = {
  fallbackDestination: {
    type: 'number',
    numberE164CheckEnabled: true,
    number: '+14155551234',
    extension: '123',
    message: 'Fallback message in case of failure.',
    description: 'Fallback for missed calls.'
  },
  provider: PhoneNumberProvider.ByoPhoneNumber, // Correct
  numberE164CheckEnabled: true,
  id: 'phone-number-id-123',
  orgId: 'org-id-456',
  createdAt: '2023-11-07T05:31:56Z',
  updatedAt: '2023-11-07T05:31:56Z',
  name: 'Test Phone Number',
  assistantId: 'assistant-id-789',
  squadId: 'squad-id-1011',
  serverUrl: 'https://example.server.url',
  serverUrlSecret: 'server-secret-123',
  number: '+14155551234',
  credentialId: 'credential-id-456'
};
