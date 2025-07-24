import { GetEmailByIdResponse } from '@/types/goHighLevel/email';
import axios from 'axios';

// Function to get email by ID
async function getEmailById(
  emailId: string,
  accessToken: string
): Promise<GetEmailByIdResponse> {
  try {
    const response = await axios.get<GetEmailByIdResponse>(
      `https://services.leadconnectorhq.com/conversations/messages/email/${emailId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching email by ID:', error);
    throw new Error('Failed to fetch email by ID.');
  }
}

// Example usage
(async () => {
  const emailId = 've9EPM428h8vShlRW1KT';
  const accessToken = 'your-access-token-here'; // Replace with your actual access token

  try {
    const emailData = await getEmailById(emailId, accessToken);
    console.log('Email Data:', emailData);
  } catch (error) {
    console.error('Error:', error);
  }
})();
