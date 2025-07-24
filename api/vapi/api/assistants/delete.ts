import fetch from 'node-fetch';

// Function to delete an assistant by ID
async function deleteAssistantById(assistantId: string): Promise<void> {
  const VAPI_URL = `https://api.vapi.ai/assistant/${assistantId}`;
  const VAPI_API_KEY = '<YOUR_VAPI_API_KEY>'; // Replace with your actual API key

  const response = await fetch(VAPI_URL, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error deleting assistant: ${error}`);
  }

  console.log(`Assistant with ID ${assistantId} deleted successfully.`);
}

// Example usage
deleteAssistantById('assistant-id-123')
  .then(() => console.log('Delete complete'))
  .catch((error) => console.error('Error:', error));
