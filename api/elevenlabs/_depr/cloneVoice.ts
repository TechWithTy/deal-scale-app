import FormData from 'form-data';
import axios from 'axios';
import fs from 'fs';

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

const handleStreamEnd = (stream: fs.ReadStream): Promise<void> => {
  return new Promise((resolve) => {
    if (!stream || stream?.closed) {
      resolve();
      return;
    }

    stream.once('end', () => {
      resolve();
    });
    stream.once('close', () => {
      resolve();
    });
  });
};

const cloneVoiceHandler = async (
  params: ICloneVoiceParams
): Promise<string> => {
  const { name, description, fileUrls = [], labels = {} } = params;
  const formData = new FormData();
  const streams: fs.ReadStream[] = [];

  // Corrected the scope of fileUrl by declaring it with const
  for (let i = 0; i < fileUrls.length; i++) {
    try {
      const fileUrl = fileUrls[i]; // Declare fileUrl from fileUrls array
      const mp3Response = await axios.get(fileUrl, {
        responseType: 'stream'
      });

      streams.push(mp3Response.data); // Save the streams to clear later

      formData.append('files', mp3Response.data, {
        contentType: 'audio/mpeg'
      });
    } catch (err) {
      console.error(`Error fetching audio file from URL: ${fileUrls}`, err);
    }
  }

  formData.append('name', name);
  formData.append('description', description);

  if (typeof labels === 'object' && labels) {
    formData.append('labels', JSON.stringify(labels));
  }

  const elevenlabsUrl = 'https://api.elevenlabs.io/v1/clone'; // Placeholder URL, replace with the actual one.
  const elevenLabsApiKey = 'your-api-key'; // Replace with your actual API key

  try {
    const elevenLabsResponse = await axios.post(elevenlabsUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        Accept: 'application/json',
        'xi-api-key': elevenLabsApiKey,
        'Access-Control-Allow-Origin': '*'
      },
      validateStatus: function (status) {
        return status >= 200 && status <= 500;
      }
    });

    const voiceId = elevenLabsResponse.data?.voice_id || '';

    // Handle the end of streams
    for (let i = 0; i < streams.length; i++) {
      const stream = streams[i];
      await handleStreamEnd(stream);
    }

    // Destroy the streams after processing
    for (let i = 0; i < streams.length; i++) {
      const stream = streams[i];
      if (stream) {
        stream.destroy();
      }
    }

    return voiceId;
  } catch (error) {
    console.error('Error cloning voice:', error);
    throw new Error('Failed to clone voice');
  }
};

// Instant clone voice function using IInstantCloneVoiceParams type
const instantCloneVoice = async (
  params: IInstantCloneVoiceParams
): Promise<string> => {
  const { voiceUrl, name, description, labels = {} } = params;

  const formData = new FormData();

  try {
    const mp3Response = await axios.get(voiceUrl, {
      responseType: 'stream'
    });

    formData.append('files', mp3Response.data, {
      contentType: 'audio/mpeg'
    });
  } catch (err) {
    console.error(`Error fetching voice audio file from URL: ${voiceUrl}`, err);
    throw new Error('Failed to fetch voice audio file');
  }

  formData.append('name', name);
  formData.append('description', description);

  if (typeof labels === 'object' && labels) {
    formData.append('labels', JSON.stringify(labels));
  }

  const elevenlabsUrl = 'https://api.elevenlabs.io/v1/clone'; // Placeholder URL, replace with the actual one.
  const elevenLabsApiKey = 'your-api-key'; // Replace with your actual API key

  try {
    const elevenLabsResponse = await axios.post(elevenlabsUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        Accept: 'application/json',
        'xi-api-key': elevenLabsApiKey,
        'Access-Control-Allow-Origin': '*'
      },
      validateStatus: function (status) {
        return status >= 200 && status <= 500;
      }
    });

    const voiceId = elevenLabsResponse.data?.voice_id || '';
    return voiceId;
  } catch (error) {
    console.error('Error cloning voice instantly:', error);
    throw new Error('Failed to clone voice instantly');
  }
};
