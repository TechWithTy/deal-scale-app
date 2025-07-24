const options = {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: {
      type: 'assistant-request',
      assistant: {
        // Fill in the relevant assistant details here
        id: 'assistant-123',
        name: 'Assistant Name'
      },
      phoneNumber: {
        // Fill in the relevant phone number details here
        id: 'phone-123',
        number: '+14155551234'
      },
      customer: {
        // Fill in the relevant customer details here
        id: 'customer-123',
        name: 'John Doe'
      },
      call: {
        // Fill in the call object details here
        id: 'call-123',
        status: 'in-progress'
      },
      artifact: {
        // Add live artifacts of the call here (transcriptions, recordings, etc.)
        recording: 'https://example.com/recording.mp3',
        transcription: 'Hello, how can I help you?'
      },
      timestamp: new Date().toISOString() // Current timestamp
    }
  })
};

fetch('https://your-server-url.com/vapi/message', options)
  .then((response) => response.json())
  .then((data) => console.log('Server response:', data))
  .catch((error) => console.error('Error:', error));
