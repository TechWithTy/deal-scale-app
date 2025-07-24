import { DeleteToolResponse } from '@/types/vapiAi/api/tools/delete';

const options = {
  method: 'DELETE',
  headers: {
    Authorization: 'Bearer <token>'
  }
};

// Perform the API call to delete a tool by ID
fetch('https://api.vapi.ai/tool/{id}', options)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Error deleting tool: ${response.statusText}`);
    }
    return response.json();
  })
  .then((deleteResponse: DeleteToolResponse) => {
    console.log('Tool deleted successfully:', deleteResponse);
  })
  .catch((error) => console.error('Error:', error));

export const exampleToolDeleteResponse = {
  id: 'tool-123',
  status: 'deleted',
  orgId: 'org-123',
  deletedAt: '2023-11-07T05:45:00Z'
};
