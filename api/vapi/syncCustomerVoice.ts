import { fetchCustomerVoices, syncVoiceWithVAPI } from '.';

/**
 * Sync the cloned voice with VAPI for the given customer
 * @param customerId - The unique ID of the customer
 * @param voiceId - The cloned voice ID from ElevenLabs
 */
async function syncCustomerVoiceWithVAPI(
  customerId: string,
  voiceId: string
): Promise<void> {
  try {
    // Sync the cloned voice with VAPI
    await syncVoiceWithVAPI(customerId, voiceId);
    console.log(
      `Successfully synced voice ${voiceId} for customer ${customerId}`
    );
  } catch (error) {
    console.error(
      `Error syncing voice ${voiceId} for customer ${customerId}:`,
      error
    );
    throw new Error('Failed to sync voice with VAPI');
  }
}

/**
 * Fetch only the voices for the authenticated customer from VAPI
 * @param customerId - The unique ID of the customer
 * @returns List of voice data for that customer
 */
async function getCustomerVoices(customerId: string): Promise<any[]> {
  try {
    // Fetch voices for this customer from VAPI
    const voices = await fetchCustomerVoices(customerId);
    console.log(`Fetched ${voices.length} voices for customer ${customerId}`);
    return voices;
  } catch (error) {
    console.error(`Error fetching voices for customer ${customerId}:`, error);
    throw new Error('Failed to fetch customer voices');
  }
}
