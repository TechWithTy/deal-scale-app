import { ElevenLabsClient } from 'elevenlabs';
import { getCustomerVoiceData } from '../../customers/getCustoemrVoiceData';
import { Readable } from 'stream'; // Node.js Readable stream

const elevenlabs = new ElevenLabsClient({
  apiKey: 'YOUR_11LABS_API_KEY' // Replace with your actual 11Labs API key
});

/**
 * Use a customer's voice for text generation.
 * This example fetches voices and uses one to generate speech.
 * @param customerId - The unique ID of the customer
 * @param text - The text to generate speech from
 * @returns The audio stream of generated speech
 */
async function useCustomerVoice(
  customerId: string,
  text: string
): Promise<Readable> {
  // Get customer-specific data to ensure isolation
  const customerData = await getCustomerVoiceData(customerId);
  const { voiceName } = customerData; // Assume customer has a preferred voice name

  try {
    // Fetch all available voices
    const voicesResponse = await elevenlabs.voices.getAll();

    // Access the array of voices in the response
    const voices = voicesResponse.voices;

    // Find a specific voice by name
    const selectedVoice = voices.find((voice: any) => voice.name === voiceName);

    if (!selectedVoice) {
      throw new Error(`No voice found with the name ${voiceName}`);
    }

    // Ensure that we are using the correct property for the voice ID
    const voiceId = selectedVoice.voice_id; // Only use voice_id

    if (!voiceId) {
      throw new Error(`No voice ID found for the selected voice`);
    }

    // Generate speech using the selected voice
    const audio = await elevenlabs.generate({
      voice: voiceId,
      text: text,
      model_id: 'eleven_multilingual_v2' // Specify the model for generation
    });

    console.log(
      `Speech generated successfully using voice: ${selectedVoice.name}`
    );
    return audio as Readable; // Return Node.js readable stream
  } catch (error) {
    console.error(`Error using voice for customer ${customerId}:`, error);
    throw new Error('Failed to generate speech using customer voice');
  }
}

export { useCustomerVoice };
