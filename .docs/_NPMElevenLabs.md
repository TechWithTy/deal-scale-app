To update the existing code to use the official **ElevenLabs JS Library** instead of manually handling requests with `axios` and `FormData`, we can simplify the code significantly. The ElevenLabs SDK abstracts a lot of the low-level HTTP logic for us, allowing us to focus on the main functionality, such as cloning voices and fetching voice data.

Here’s how you can update the code using the **ElevenLabs JS SDK** and a new **`README.md`** explaining how to use it.

---

## Updated Code

### `voiceCloning.ts`

```typescript
import { ElevenLabsClient } from 'elevenlabs';

export interface ICloneVoiceParams {
  description: string;
  name: string;
  fileUrls: string[];
  labels: Record<string, string>;
}

// Parameters for instant voice cloning
export interface IInstantCloneVoiceParams {
  voiceUrl: string; // URL of the voice to clone
  name: string;
  description: string;
  labels?: Record<string, string>;
}

const elevenlabs = new ElevenLabsClient({
  apiKey: 'YOUR_API_KEY' // Replace with your actual ElevenLabs API key
});

/**
 * Clone a voice using multiple files.
 * @param params ICloneVoiceParams
 * @returns The ID of the cloned voice.
 */
export const cloneVoiceHandler = async (
  params: ICloneVoiceParams
): Promise<string> => {
  const { name, description, fileUrls, labels = {} } = params;

  // Convert file URLs into audio streams and prepare for the cloning process
  const audioStreams = await Promise.all(
    fileUrls.map(async (url) => {
      const response = await fetch(url);
      return response.body; // Assuming `response.body` is a readable stream
    })
  );

  try {
    const response = await elevenlabs.voices.clone({
      name,
      description,
      files: audioStreams,
      labels
    });

    const voiceId = response.voice_id;
    console.log(`Voice cloned successfully. ID: ${voiceId}`);
    return voiceId;
  } catch (error) {
    console.error('Error cloning voice:', error);
    throw new Error('Failed to clone voice');
  }
};

/**
 * Instantly clone a voice using a single audio file.
 * @param params IInstantCloneVoiceParams
 * @returns The ID of the cloned voice.
 */
export const instantCloneVoice = async (
  params: IInstantCloneVoiceParams
): Promise<string> => {
  const { voiceUrl, name, description, labels = {} } = params;

  try {
    const response = await fetch(voiceUrl);
    const audioStream = response.body; // Assuming `response.body` is a readable stream

    const clonedVoice = await elevenlabs.voices.clone({
      name,
      description,
      files: [audioStream],
      labels
    });

    const voiceId = clonedVoice.voice_id;
    console.log(`Voice cloned successfully. ID: ${voiceId}`);
    return voiceId;
  } catch (error) {
    console.error('Error cloning voice instantly:', error);
    throw new Error('Failed to clone voice instantly');
  }
};
```

### Explanation of Changes:

1. **ElevenLabsClient**: We are now using the official **ElevenLabs SDK**. This simplifies requests, voice cloning, and other interactions with the Eleven Labs API.
2. **Voice Cloning**:
   - `cloneVoiceHandler`: Takes multiple file URLs and clones a voice using the Eleven Labs SDK.
   - `instantCloneVoice`: Takes a single file URL and clones a voice instantly.
3. **API Key Management**: The API key is passed when creating the `ElevenLabsClient` instance, which handles authentication with the Eleven Labs API.

---

## `README.md`

````md
# ElevenLabs Voice Cloning Utility

This utility provides a simple way to clone voices using the [ElevenLabs JS SDK](https://www.npmjs.com/package/elevenlabs). You can clone voices using multiple audio file URLs or instantly clone using a single audio file URL.

## Installation

Install the necessary dependencies:

```bash
npm install elevenlabs
# or
yarn add elevenlabs
```
````

### Prerequisites

- **Node.js**: Make sure you have Node.js installed.
- **ElevenLabs API Key**: You will need an API key from ElevenLabs. Replace the placeholder `YOUR_API_KEY` in the code with your actual API key.

## Usage

### Clone Voice with Multiple Files

This function allows you to clone a voice using multiple audio files.

#### Parameters:

- `description` (string): A description of the cloned voice.
- `name` (string): The name of the cloned voice.
- `fileUrls` (string[]): An array of URLs pointing to the audio files that will be used for cloning.
- `labels` (Record<string, string>): Optional key-value metadata.

#### Example:

```typescript
import { cloneVoiceHandler } from './voiceCloning';

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

### Instant Clone Voice

This function allows you to clone a voice instantly using a single audio file.

#### Parameters:

- `voiceUrl` (string): The URL of the audio file.
- `name` (string): The name of the cloned voice.
- `description` (string): A description of the cloned voice.
- `labels` (Record<string, string>, optional): Optional key-value metadata.

#### Example:

```typescript
import { instantCloneVoice } from './voiceCloning';

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

### API Key Configuration

Replace the placeholder `YOUR_API_KEY` with your actual API key from ElevenLabs in the following line:

```typescript
const elevenlabs = new ElevenLabsClient({
  apiKey: 'YOUR_API_KEY' // Replace with your actual API key
});
```

## Voice Cloning Response

Both functions return the ID of the cloned voice from ElevenLabs.

```bash
Cloned voice ID: 12345abcde
```

## Error Handling

Errors during voice cloning (such as invalid file URLs or service errors) will be caught and logged. Wrap the functions in `try-catch` blocks to handle these errors effectively.

```typescript
try {
  const voiceId = await cloneVoiceHandler(voiceParams);
} catch (error) {
  console.error('Error cloning voice:', error);
}
```

## License

This project is licensed under the MIT License.

```

---

### Summary of Updates:

1. **ElevenLabs SDK Integration**: We switched from manual `axios` requests and `FormData` to the official ElevenLabs SDK, simplifying code and ensuring better integration with ElevenLabs services.

2. **Updated Documentation**: The `README.md` was updated to reflect how to install, configure, and use the new ElevenLabs SDK-based functions.

This approach provides a much cleaner and simpler method of interacting with Eleven Labs for cloning voices.
```
