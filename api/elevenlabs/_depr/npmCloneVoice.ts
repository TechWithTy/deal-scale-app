const { ElevenLabsClient, play } = require('elevenlabs');

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
