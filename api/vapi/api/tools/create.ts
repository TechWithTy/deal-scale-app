// api/tools.ts

import { ToolMessageType, MessageRole } from '@/types/vapiAi/api/calls/create';
import {
  CreateToolRequest,
  ConditionOperator,
  ToolType,
  CreateToolResponse
} from '@/types/vapiAi/api/tools/create';

// Function to create a tool
export async function createTool(token: string, toolData: CreateToolRequest) {
  const url = 'https://api.vapi.ai/tool';

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(toolData)
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating tool: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Tool created successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error creating tool:', error);
    throw error;
  }
}

// Example usage
const token = '<your_token_here>';
const toolData: CreateToolRequest = {
  async: false,
  messages: [
    {
      type: ToolMessageType.ToolMessageStart,
      content: 'Processing your request, please wait...',
      role: MessageRole.Assistant
    }
  ],
  type: ToolType.DTMF,
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

// Call the function
createTool(token, toolData)
  .then((tool) => console.log('Tool Created:', tool))
  .catch((error) => console.error('Tool Creation Error:', error));

const exampleToolResponse: CreateToolResponse = {
  async: false,
  messages: [
    {
      type: ToolMessageType.ToolMessageStart,
      content: 'Processing your request, please wait...',
      role: MessageRole.Assistant
    }
  ],
  type: ToolType.DTMF,
  id: 'tool-id-123',
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
