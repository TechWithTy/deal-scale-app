import axios from 'axios';

// Base URL for VAPI API (replace with actual URL from VAPI docs)
const VAPI_BASE_URL = 'https://api.vapi.ai';

// API key or token for VAPI API (replace with your actual API key/token)
const VAPI_API_KEY = 'YOUR_VAPI_API_KEY';

/**
 * Sync a cloned voice with VAPI.
 * @param customerId - The unique ID of the customer
 * @param voiceId - The cloned voice ID from ElevenLabs
 * @returns A promise that resolves when the sync is complete
 */
export const syncVoiceWithVAPI = async (
  customerId: string,
  voiceId: string
): Promise<void> => {
  const url = `${VAPI_BASE_URL}/vapi/voices/sync`;

  const payload = {
    customerId,
    voiceId
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 || response.status === 201) {
      console.log(
        `Voice ID ${voiceId} synced successfully for customer ${customerId}`
      );
    } else {
      console.error(
        `Failed to sync voice for customer ${customerId}: ${response.statusText}`
      );
      throw new Error(`Failed to sync voice: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error syncing voice with VAPI:', error);
    throw new Error('Sync with VAPI failed.');
  }
};

/**
 * Fetch all cloned voices for a specific customer from VAPI.
 * @param customerId - The unique ID of the customer
 * @returns A promise that resolves with an array of voices for the customer
 */
export const fetchCustomerVoices = async (
  customerId: string
): Promise<any[]> => {
  const url = `${VAPI_BASE_URL}/vapi/voices/customer/${customerId}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const voices = response.data.voices;
      console.log(`Fetched ${voices.length} voices for customer ${customerId}`);
      return voices;
    } else {
      console.error(
        `Failed to fetch voices for customer ${customerId}: ${response.statusText}`
      );
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error fetching customer voices from VAPI:', error);
    throw new Error('Fetch customer voices failed.');
  }
};
