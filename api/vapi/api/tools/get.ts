// api/tools.ts

import { ToolMessageType, MessageRole } from '@/types/vapiAi/api/calls/create';
import { ToolType } from '@/types/vapiAi/api/tools/create';
import { GetToolResponse } from '@/types/vapiAi/api/tools/get';

// Function to get a tool by its ID
export async function getToolById(
  token: string,
  toolId: string
): Promise<GetToolResponse> {
  const url = `https://api.vapi.ai/tool/${toolId}`;

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
      throw new Error(`Error fetching tool: ${errorText}`);
    }

    const toolData: GetToolResponse = await response.json();
    console.log('Tool fetched successfully:', toolData);
    return toolData;
  } catch (error) {
    console.error('Error fetching tool:', error);
    throw error;
  }
}

// Example usage
const token = '<your_token_here>';
const toolId = 'tool-id-123';

getToolById(token, toolId)
  .then((tool) => console.log('Tool Data:', tool))
  .catch((error) => console.error('Error fetching tool:', error));

const exampleToolResponse: GetToolResponse = {
  id: '23423adasd',
  async: false,
  messages: [
    {
      type: ToolMessageType.ToolMessageStart,
      content: 'Processing your request, please wait...',
      role: MessageRole.Assistant
    }
  ],
  type: ToolType.DTMF, // Use enum value here instead of a string  id: 'tool-id-123',
  orgId: 'org-id-123',
  createdAt: '2023-11-07T05:31:56Z',
  updatedAt: '2023-11-07T05:31:56Z',
  function: {
    name: 'DTMF Tool',
    description: 'Tool for detecting DTMF tones',
    parameters: {
      type: 'object',
      properties: {},
      required: ['param1']
    }
  },
  server: {
    timeoutSeconds: 20,
    url: 'https://example.com/dtmf-tool',
    secret: 'superSecret'
  }
};

console.log(exampleToolResponse);
