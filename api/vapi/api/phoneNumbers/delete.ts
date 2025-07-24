import { PhoneNumberProvider } from '@/types/vapiAi/api/phoneNumbers/create';
import { DeletePhoneNumberResponse } from '@/types/vapiAi/api/phoneNumbers/delete';

// Function to delete a phone number by ID
async function deletePhoneNumberById(
  phoneNumberId: string,
  token: string
): Promise<DeletePhoneNumberResponse> {
  const url = `https://api.vapi.ai/phone-number/${phoneNumberId}`;

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
      throw new Error(`Error deleting phone number: ${errorText}`);
    }

    // Parse and return the response data
    const responseData: DeletePhoneNumberResponse =
      (await response.json()) as DeletePhoneNumberResponse;
    return responseData;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// Example usage
const token = '<your_token_here>';
deletePhoneNumberById('phone-number-id-123', token)
  .then((deletedPhoneNumber) =>
    console.log('Deleted Phone Number:', deletedPhoneNumber)
  )
  .catch((err) => console.error('Error deleting phone number:', err));

export const exampleDeletePhoneNumberResponse: DeletePhoneNumberResponse = {
  fallbackDestination: {
    type: 'number',
    numberE164CheckEnabled: true,
    number: '+14155551234',
    extension: '123',
    message: 'Backup destination in case of failure',
    description: 'Test description for the fallback'
  },
  provider: PhoneNumberProvider.ByoPhoneNumber, // Correct
  numberE164CheckEnabled: true,
  id: 'phone-number-id-123',
  orgId: 'org-id-456',
  createdAt: '2023-11-07T05:31:56Z',
  updatedAt: '2023-11-07T05:31:56Z',
  name: 'Main Office Line',
  assistantId: 'assistant-id-789',
  squadId: 'squad-id-321',
  serverUrl: 'https://example.com/server-url',
  serverUrlSecret: 'secret-key',
  number: '+14155551234',
  credentialId: 'credential-id-654'
};
