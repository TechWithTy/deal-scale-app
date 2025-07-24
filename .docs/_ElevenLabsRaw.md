Certainly! Here's a sample `README.md` file that explains how to use the `cloneVoiceHandler` and `instantCloneVoice` functions correctly:

---

# Voice Cloning Utility

This utility provides two methods for cloning a voice using an external service (e.g., Eleven Labs). You can clone a voice using multiple audio files (`cloneVoiceHandler`) or instantly clone using a single audio file URL (`instantCloneVoice`).

## Installation

To use the voice cloning utility, you'll need to install the following dependencies:

```bash
npm install axios form-data fs
```

### Prerequisites

- **Node.js**: Make sure you have Node.js installed.
- **API Key**: You will need an API key from the voice cloning service (e.g., Eleven Labs). Replace the placeholder `your-api-key` in the code with your actual API key.

## Usage

There are two primary functions:

1. `cloneVoiceHandler`: Allows you to clone a voice using multiple audio file URLs.
2. `instantCloneVoice`: Allows you to instantly clone a voice using a single audio file URL.

### 1. Cloning a Voice with Multiple Audio Files

This function allows you to pass multiple audio files to clone a voice.

#### Parameters:

- `description` (string): A description of the cloned voice.
- `name` (string): The name of the cloned voice.
- `fileUrls` (string[]): An array of URLs pointing to the audio files that will be used for cloning.
- `labels` (Record<string, string>): An optional key-value map of labels for additional metadata.

#### Example:

```typescript
import { cloneVoiceHandler } from './your-module-path';

const cloneVoice = async () => {
  const voiceParams = {
    description: 'Sample voice description',
    name: 'SampleVoice',
    fileUrls: [
      'https://example.com/audio1.mp3',
      'https://example.com/audio2.mp3'
    ],
    labels: { tag: 'example', usage: 'test' }
  };

  try {
    const voiceId = await cloneVoiceHandler(voiceParams);
    console.log(`Cloned voice ID: ${voiceId}`);
  } catch (err) {
    console.error('Error cloning voice:', err);
  }
};

cloneVoice();
```

### 2. Instantly Cloning a Voice Using a Single File

This function allows you to quickly clone a voice by passing a single audio file URL.

#### Parameters:

- `voiceUrl` (string): URL of the audio file to be used for cloning.
- `name` (string): The name of the cloned voice.
- `description` (string): A description of the cloned voice.
- `labels` (Record<string, string>, optional): An optional key-value map of labels for additional metadata.

#### Example:

```typescript
import { instantCloneVoice } from './your-module-path';

const instantClone = async () => {
  const voiceParams = {
    voiceUrl: 'https://example.com/audio.mp3',
    name: 'InstantVoice',
    description: 'An instant cloned voice',
    labels: { category: 'test', origin: 'sample' }
  };

  try {
    const voiceId = await instantCloneVoice(voiceParams);
    console.log(`Instantly cloned voice ID: ${voiceId}`);
  } catch (err) {
    console.error('Error cloning voice instantly:', err);
  }
};

instantClone();
```

## API Key Configuration

Make sure to replace the placeholder `your-api-key` with the actual API key provided by the voice cloning service you're using (e.g., Eleven Labs):

```typescript
const elevenLabsApiKey = 'your-api-key'; // Replace this with your actual API key
```

## Response

Both functions return a `voiceId` string, which is the unique identifier of the cloned voice from the service.

### Example Response:

```bash
Cloned voice ID: 12345abcde
```

## Error Handling

Errors during voice cloning (such as invalid file URLs or service errors) will be caught and logged. Ensure you wrap the functions in `try-catch` blocks to handle these errors effectively.

```typescript
try {
  const voiceId = await cloneVoiceHandler(voiceParams);
} catch (error) {
  console.error('Error cloning voice:', error);
}
```

## Stream Handling

The audio streams used during the cloning process are managed internally. The utility ensures streams are properly closed and destroyed to avoid memory leaks.

---

### License

This project is licensed under the MIT License.

---

### Notes

- Ensure that your audio file URLs are valid and accessible by the API.
- Make sure to adhere to the service’s API rate limits and quotas.
