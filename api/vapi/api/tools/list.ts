import { ListToolsResponse } from '@/types/vapiAi/api/tools/list';

const options = {
  method: 'GET',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  }
};

// API call to list tools
fetch('https://api.vapi.ai/tool', options)
  .then((response) => response.json())
  .then((data: ListToolsResponse) => {
    console.log('Total tools:', data.totalCount);
    console.log('Tools:', data.tools);
  })
  .catch((error) => console.error('Error fetching tools:', error));

export const exampleToolListResponse = {
  tools: [
    {
      async: false,
      messages: [
        {
          type: 'request-start',
          content: 'Starting the DTMF tool',
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
      updatedAt: '2023-11-07T05:31:56Z',
      function: {
        name: 'DTMF Function',
        description: 'Detect DTMF tones',
        parameters: {
          type: 'object',
          properties: {},
          required: ['tones']
        }
      },
      server: {
        timeoutSeconds: 20,
        url: 'https://server.url',
        secret: 'superSecretKey'
      }
    }
  ],
  totalCount: 1
};
