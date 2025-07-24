import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import { GetEmailByIdResponse } from '@/types/goHighLevel/email';
import axios from 'axios';

/**
 * Get an email by its ID.
 * @param emailId - The ID of the email to retrieve.
 * @param token - The access token for authorization.
 * @returns A Promise containing the email data.
 */
export const getEmailById = async (
  emailId: string,
  token: string
): Promise<GetEmailByIdResponse> => {
  const url = `${BASE_URL}/conversations/messages/email/${emailId}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

interface CancelEmailResponse {
  status: number;
  message: string;
}

export const cancelScheduledEmail = async (
  emailMessageId: string,
  token: string
): Promise<CancelEmailResponse> => {
  const url = `${BASE_URL}/conversations/messages/email/${emailMessageId}/schedule`;
  const response = await axios.delete(url, getHeaders(token));
  return response.data;
};
