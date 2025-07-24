import {
  CreatePhoneNumberRequest,
  CreatePhoneNumberResponse,
  PhoneNumberProvider
} from '@/types/vapiAi/api/phoneNumbers/create';
import { UpdatePhoneNumberResponse } from '@/types/vapiAi/api/phoneNumbers/update';

// Function to create a phone number
async function createPhoneNumber(
  token: string,
  phoneNumberData: CreatePhoneNumberRequest
): Promise<CreatePhoneNumberResponse> {
  const url = `https://api.vapi.ai/phone-number`;

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(phoneNumberData)
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating phone number: ${errorText}`);
    }

    // Explicitly cast the response to CreatePhoneNumberResponse
    const responseData: CreatePhoneNumberResponse =
      (await response.json()) as CreatePhoneNumberResponse;
    console.log('Phone number created successfully:', responseData);

    return responseData;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// Example usage
const token = '<your_token_here>';
const phoneNumberData: CreatePhoneNumberRequest = {
  fallbackDestination: {
    type: 'number',
    numberE164CheckEnabled: true,
    number: '+14155551234',
    extension: '123',
    message: 'Test message',
    description: 'Test description'
  },
  provider: PhoneNumberProvider.ByoPhoneNumber, // Correct
  numberE164CheckEnabled: true,
  number: '+14155551234',
  credentialId: 'credential-123',
  name: 'Test Phone Number',
  assistantId: 'assistant-123',
  squadId: 'squad-123',
  serverUrl: 'https://example.com/server',
  serverUrlSecret: 'server-secret'
};

createPhoneNumber(token, phoneNumberData)
  .then((response) => console.log('Phone number response:', response))
  .catch((error) => console.error('Error:', error));

export const exampleUpdatePhoneNumberResponse: UpdatePhoneNumberResponse = {
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
  updatedAt: '2023-11-08T05:31:56Z', // The updated timestamp
  name: 'Updated Phone Number',
  assistantId: 'assistant-123',
  squadId: 'squad-123',
  serverUrl: 'https://updated-server-url.com',
  serverUrlSecret: 'updated-secret-key',
  number: '+14155551234',
  credentialId: 'credential-123'
};
