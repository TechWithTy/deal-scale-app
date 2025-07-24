import { GenerateSpeechResponse } from '@/types/elevenLabs';
import axios from 'axios';
import { Readable } from 'stream';
// ElevenLabs API URL and API key
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const API_KEY = 'YOUR_11LABS_API_KEY'; // Replace with your actual API key

// Function to generate speech using a cloned voice
export async function generateSpeech(
  voiceId: string,
  text: string
): Promise<Readable> {
  try {
    const response = await axios.post<GenerateSpeechResponse>(
      `${ELEVENLABS_API_URL}/text-to-speech`,
      {
        voice_id: voiceId,
        text: text,
        model_id: 'eleven_multilingual_v2' // Optional model, can be customized
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream' // We want the audio stream
      }
    );
    return response.data as unknown as Readable; // Node.js readable stream
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Speech generation failed.');
  }
}
