import { AnalyticsResponse } from '@/types/vapiAi/api/_analytics';

const options = {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    queries: [
      {
        table: 'call',
        groupBy: ['assistantId', 'endedReason'],
        name: 'callAnalyticsQuery',
        timeRange: {
          step: 'day',
          start: '2023-01-01T00:00:00Z',
          end: '2023-01-31T23:59:59Z',
          timezone: 'UTC'
        },
        operations: [
          { operation: 'sum', column: 'duration', alias: 'sumDuration' },
          { operation: 'avg', column: 'cost', alias: 'avgCost' }
        ]
      }
    ]
  })
};

fetch('https://api.vapi.ai/analytics', options)
  .then((response) => response.json())
  .then((data: AnalyticsResponse) => {
    console.log(data);
    data.data.forEach((queryResult) => {
      console.log('Query Name:', queryResult.name);
      console.log('Time Range:', queryResult.timeRange);
      queryResult.result.forEach((result) => {
        console.log('Date:', result.date);
        console.log('Assistant ID:', result.assistantId);
        console.log('Ended Reason:', result.endedReason);
        console.log('Sum Duration:', result.sumDuration);
        console.log('Avg Cost:', result.avgCost);
      });
    });
  })
  .catch((err) => console.error(err));

export const exampleAnalyticsQuery = {
  data: [
    {
      name: 'callAnalyticsQuery',
      timeRange: {
        step: 'day',
        start: '2023-01-01T00:00:00Z',
        end: '2023-01-31T23:59:59Z',
        timezone: 'UTC'
      },
      result: [
        {
          date: '2023-01-01',
          assistantId: '123',
          endedReason: 'customer-ended-call',
          sumDuration: 120,
          avgCost: 10.5
        },
        {
          date: '2023-01-02',
          assistantId: '123',
          endedReason: 'customer-did-not-give-microphone-permission',
          sumDuration: 0,
          avgCost: 0
        }
      ]
    }
  ]
};
