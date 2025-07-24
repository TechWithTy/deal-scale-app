import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import axios from 'axios';
/**
 * Starts OAuth for TikTok Account.
 * @param locationId - The location ID.
 * @param userId - The user ID.
 * @param token - The access token.
 * @param page - Optional page query parameter.
 * @param reconnect - Optional reconnect query parameter.
 */
export const startTikTokOAuth = async (
  locationId: string,
  userId: string,
  token: string,
  page?: string,
  reconnect?: string
): Promise<void> => {
  const url = `${BASE_URL}/social-media-posting/oauth/tiktok/start`;
  const params = new URLSearchParams();
  params.append('locationId', locationId);
  params.append('userId', userId);
  if (page) params.append('page', page);
  if (reconnect) params.append('reconnect', reconnect);

  window.open(`${url}?${params.toString()}`, '_blank');

  // Listening for the event data response
  window.addEventListener(
    'message',
    (e) => {
      if (e.data && e.data.page === 'social_media_posting') {
        const { actionType, accountId, reconnectAccounts } = e.data;
        // Handle the data as needed
      }
    },
    false
  );
};

/**
 * Fetches the TikTok profile for a given account ID and location ID.
 * @param locationId - The location ID.
 * @param accountId - The TikTok account ID.
 * @param token - The access token.
 * @returns Promise containing the TikTok profile data.
 */
export const getTikTokProfile = async (
  locationId: string,
  accountId: string,
  token: string
): Promise<any> => {
  const url = `${BASE_URL}/social-media-posting/oauth/${locationId}/tiktok/accounts/${accountId}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

interface AttachTikTokProfileRequest {
  type: 'profile' | 'business';
  originId: string;
  name: string;
  avatar: string;
  verified: boolean;
  username: string;
  companyId?: string;
}

/**
 * Attaches a TikTok profile to a location.
 * @param locationId - The location ID.
 * @param accountId - The TikTok account ID.
 * @param token - The access token.
 * @param data - The request data to attach the TikTok profile.
 * @returns Promise containing the response data.
 */
export const attachTikTokProfile = async (
  locationId: string,
  accountId: string,
  token: string,
  data: AttachTikTokProfileRequest
): Promise<any> => {
  const url = `${BASE_URL}/social-media-posting/oauth/${locationId}/tiktok/accounts/${accountId}`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};

/**
 * Starts OAuth for TikTok Business Account.
 * @param locationId - The location ID.
 * @param userId - The user ID.
 * @param token - The access token.
 * @param page - Optional page query parameter.
 * @param reconnect - Optional reconnect query parameter.
 */
export const startTikTokBusinessOAuth = async (
  locationId: string,
  userId: string,
  token: string,
  page?: string,
  reconnect?: string
): Promise<void> => {
  const url = `${BASE_URL}/social-media-posting/oauth/tiktok-business/start`;
  const params = new URLSearchParams();
  params.append('locationId', locationId);
  params.append('userId', userId);
  if (page) params.append('page', page);
  if (reconnect) params.append('reconnect', reconnect);

  window.open(`${url}?${params.toString()}`, '_blank');

  // Listening for the event data response
  window.addEventListener(
    'message',
    (e) => {
      if (e.data && e.data.page === 'social_media_posting') {
        const { actionType, accountId, reconnectAccounts } = e.data;
        // Handle the data as needed
      }
    },
    false
  );
};

/**
 * Fetches the TikTok Business profile for a given account ID and location ID.
 * @param locationId - The location ID.
 * @param accountId - The TikTok Business account ID.
 * @param token - The access token.
 * @returns Promise containing the TikTok Business profile data.
 */
export const getTikTokBusinessProfile = async (
  locationId: string,
  accountId: string,
  token: string
): Promise<any> => {
  const url = `${BASE_URL}/social-media-posting/oauth/${locationId}/tiktok-business/accounts/${accountId}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};
