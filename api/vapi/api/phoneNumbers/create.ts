import {
  CreatePhoneNumberRequest,
  CreatePhoneNumberResponse,
  PhoneNumberProvider
} from '@/types/vapiAi/api/phoneNumbers/create';
import fetch from 'node-fetch';

// API call to create a phone number
async function createPhoneNumber(
  apiUrl: string,
  apiKey: string,
  phoneNumberRequestData: CreatePhoneNumberRequest
): Promise<CreatePhoneNumberResponse> {
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(phoneNumberRequestData)
  };

  try {
    const response = await fetch(apiUrl, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating phone number: ${errorText}`);
    }

    // Cast the JSON response to the expected type
    const responseData = (await response.json()) as CreatePhoneNumberResponse;
    console.log('Phone number created successfully:', responseData);

    return responseData; // Return the response data if needed
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error if needed for further handling
  }
}

// Example usage of the createPhoneNumber function
const apiUrl = 'https://api.vapi.ai/phone-number';
const apiKey = '<YOUR_VAPI_API_KEY>'; // Replace with your actual API key

const phoneNumberRequestData: CreatePhoneNumberRequest = {
  fallbackDestination: {
    type: 'number',
    numberE164CheckEnabled: true,
    number: '+14155551234',
    extension: '123',
    message: 'This is a fallback message.',
    description: 'Fallback description.'
  },
  provider: PhoneNumberProvider.ByoPhoneNumber, // Correct
  numberE164CheckEnabled: true,
  number: '+14155551234',
  credentialId: 'credential-id-123',
  name: 'Test Phone Number',
  assistantId: 'assistant-id-123',
  squadId: 'squad-id-123',
  serverUrl: 'https://server.url',
  serverUrlSecret: 'server-secret-123'
};

// Call the function
createPhoneNumber(apiUrl, apiKey, phoneNumberRequestData)
  .then((response) => console.log('Phone Number Response:', response))
  .catch((error) => console.error('Phone Number Error:', error));

export const exampleCreatePhoneNumberResponse: CreatePhoneNumberResponse = {
  fallbackDestination: {
    type: 'number',
    numberE164CheckEnabled: true,
    number: '+14155551234',
    extension: '123',
    message: 'This is a fallback message.',
    description: 'Fallback description.'
  },
  provider: PhoneNumberProvider.ByoPhoneNumber, // Correct
  numberE164CheckEnabled: true,
  id: 'phone-number-id-123',
  orgId: 'org-id-123',
  createdAt: '2023-09-07T12:00:00Z',
  updatedAt: '2023-09-07T12:30:00Z',
  name: 'Test Phone Number',
  assistantId: 'assistant-id-123',
  squadId: 'squad-id-123',
  serverUrl: 'https://server.url',
  serverUrlSecret: 'server-secret-123',
  number: '+14155551234',
  credentialId: 'credential-id-123'
};
