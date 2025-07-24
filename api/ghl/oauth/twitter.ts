import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import {
  OAuthStartResponse,
  OAuthResponse,
  AttachAccountRequest
} from '@/types/goHighLevel/oauth';
import axios from 'axios';

export const startTwitterOAuth = (
  locationId: string,
  userId: string,
  token: string,
  page?: string,
  reconnect?: string
): void => {
  const url = `${BASE_URL}/social-media-posting/oauth/twitter/start`;
  const params = new URLSearchParams({ locationId, userId });
  if (page) params.append('page', page);
  if (reconnect) params.append('reconnect', reconnect);

  // Open URL in new window for OAuth
  window.open(`${url}?${params.toString()}`, '_blank');

  // Listen for the OAuth response event
  window.addEventListener(
    'message',
    (e) => {
      if (e.data && e.data.page === 'social_media_posting') {
        const { actionType, platform, accountId } =
          e.data as OAuthStartResponse;
        console.log('Twitter OAuth Event:', actionType, platform, accountId);
      }
    },
    false
  );
};

export const getTwitterAccounts = async (
  locationId: string,
  accountId: string,
  token: string
): Promise<OAuthResponse> => {
  const url = `${BASE_URL}/social-media-posting/oauth/${locationId}/twitter/accounts/${accountId}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};
export const attachTwitterAccount = async (
  locationId: string,
  accountId: string,
  token: string,
  data: AttachAccountRequest
): Promise<OAuthResponse> => {
  const url = `${BASE_URL}/social-media-posting/oauth/${locationId}/twitter/accounts/${accountId}`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};
