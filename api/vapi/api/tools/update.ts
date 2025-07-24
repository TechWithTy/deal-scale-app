import { UpdateToolResponse } from '@/types/vapiAi/api/tools/update';

const options = {
  method: 'PATCH',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    async: false,
    messages: [
      {
        type: 'request-start',
        content: 'Starting the tool',
        conditions: [{ value: 'start', operator: 'eq', param: 'trigger' }]
      }
    ],
    function: {
      name: 'Custom Tool Function',
      description: 'This is a custom tool function.',
      parameters: {
        type: 'object',
        properties: {},
        required: ['parameter1']
      }
    },
    server: {
      timeoutSeconds: 20,
      url: 'https://custom-server.url',
      secret: 'superSecretKey'
    }
  })
};

// Perform the API call
fetch('https://api.vapi.ai/tool/{id}', options)
  .then((response) => response.json())
  .then((updatedTool: UpdateToolResponse) => {
    console.log('Updated Tool:', updatedTool);
  })
  .catch((error) => console.error('Error updating tool:', error));

export const exampleToolUpdateResponse = {
  async: false,
  messages: [
    {
      type: 'request-start',
      content: 'Starting the tool',
      conditions: [
        {
          value: 'start',
          operator: 'eq',
          param: 'trigger'
        }
      ]
    }
  ],
  type: 'dtmf',
  id: 'tool-123',
  orgId: 'org-123',
  createdAt: '2023-11-07T05:31:56Z',
  updatedAt: '2023-11-07T05:32:00Z',
  function: {
    name: 'Custom Tool Function',
    description: 'This is a custom tool function.',
    parameters: {
      type: 'object',
      properties: {},
      required: ['parameter1']
    }
  },
  server: {
    timeoutSeconds: 20,
    url: 'https://custom-server.url',
    secret: 'superSecretKey'
  }
};
