import {
  ListCallsQueryParams,
  ListCallsResponse
} from '@/types/vapiAi/api/calls/list';

// Function to fetch list of calls with query parameters
async function listCalls(
  token: string,
  params: ListCallsQueryParams = {}
): Promise<ListCallsResponse> {
  const queryParams = new URLSearchParams(params as any).toString(); // Convert params to query string
  const url = `https://api.vapi.ai/call?${queryParams}`;

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
      const error = await response.text();
      throw new Error(`Error fetching call list: ${error}`);
    }

    const callListData: ListCallsResponse = await response.json();
    return callListData;
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// Example usage
const token = '<your_token_here>';
const queryParams: ListCallsQueryParams = {
  limit: 10,
  assistantId: 'assistant-id-123',
  createdAtGt: '2023-01-01T00:00:00Z'
};

listCalls(token, queryParams)
  .then((callList) => console.log('Call list:', callList))
  .catch((err) => console.error('Error fetching call list:', err));

export const exampleListCallsResponse: ListCallsResponse = {
  calls: [
    {
      id: 'call-id-001',
      orgId: 'org-id-001',
      type: 'inboundPhoneCall',
      monitor: {
        listenUrl: 'https://example.com/listen',
        controlUrl: 'https://example.com/control'
      },
      phoneCallProvider: 'twilio',
      phoneCallTransport: 'sip',
      status: 'ended',
      endedReason: 'assistant-error',
      messages: [
        {
          role: 'user',
          message: 'Hello, how can I help?',
          time: Date.now(),
          secondsFromStart: 5,
          endTime: Date.now() + 1000,
          duration: 1
        }
      ],
      createdAt: '2023-09-07T12:00:00Z',
      updatedAt: '2023-09-07T12:05:00Z',
      startedAt: '2023-09-07T12:01:00Z',
      endedAt: '2023-09-07T12:04:30Z',
      cost: 5.0,
      costBreakdown: {
        transport: 1.5,
        stt: 1.0,
        llm: 0.5,
        tts: 0.8,
        vapi: 1.2,
        total: 5.0,
        llmPromptTokens: 100,
        llmCompletionTokens: 80,
        ttsCharacters: 500
      },
      transcript: 'Transcript of the call goes here...',
      recordingUrl: 'https://example.com/recording.mp3',
      stereoRecordingUrl: 'https://example.com/stereo-recording.mp3',
      artifact: {
        videoRecordingEnabled: true,
        recordingS3PathPrefix: 's3://recordings/call-id-001'
      },
      analysis: {
        summary: 'The call ended due to an error.',
        structuredData: {},
        successEvaluation: 'unsuccessful'
      },
      assistantId: 'assistant-id-001'
    }
    // More calls...
  ],
  totalCount: 20 // Optional total count of calls
};
