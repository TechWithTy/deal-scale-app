import axios from 'axios';

// Base URL for your customer service (replace with actual URL)
const CUSTOMER_SERVICE_BASE_URL = 'https://api.yourdomain.com';

/**
 * Interface representing the customer's voice data.
 */
interface ICustomerVoiceData {
  voiceName: string;
  voiceDescription: string;
  // Add more fields as necessary (e.g., labels, voice settings, etc.)
  labels?: Record<string, string>;
}

/**
 * Fetch the customer's voice data from the customer service.
 * @param customerId - The unique ID of the customer
 * @returns A promise that resolves with the customer's voice data
 */
export const getCustomerVoiceData = async (
  customerId: string
): Promise<ICustomerVoiceData> => {
  const url = `${CUSTOMER_SERVICE_BASE_URL}/customers/${customerId}/voice-data`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer YOUR_AUTH_TOKEN` // Replace with actual auth method
      }
    });

    if (response.status === 200) {
      const voiceData = response.data;
      console.log(`Successfully fetched voice data for customer ${customerId}`);
      return voiceData;
    } else {
      console.error(
        `Failed to fetch voice data for customer ${customerId}: ${response.statusText}`
      );
      throw new Error(
        `Failed to fetch customer voice data: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(
      `Error fetching customer voice data for customer ${customerId}:`,
      error
    );
    throw new Error('Could not fetch customer voice data.');
  }
};
