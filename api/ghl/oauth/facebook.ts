import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import {
  OAuthStartResponse,
  OAuthResponse,
  AttachFacebookPageRequest
} from '@/types/goHighLevel/oauth';
import axios from 'axios';

// Starts OAuth for Facebook
export const startFacebookOAuth = async (
  locationId: string,
  userId: string,
  token: string,
  page?: string,
  reconnect?: string
): Promise<void> => {
  const url = `${BASE_URL}/social-media-posting/oauth/facebook/start`;
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
        const { actionType, page, platform, accountId } =
          e.data as OAuthStartResponse;
        console.log('OAuth Event:', actionType, page, platform, accountId);
      }
    },
    false
  );
};

// Get Facebook Pages
export const getFacebookPages = async (
  locationId: string,
  accountId: string,
  token: string
): Promise<OAuthResponse> => {
  const url = `${BASE_URL}/social-media-posting/oauth/${locationId}/facebook/accounts/${accountId}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

// Attach Facebook Pages
export const attachFacebookPages = async (
  locationId: string,
  accountId: string,
  token: string,
  data: AttachFacebookPageRequest
): Promise<OAuthResponse> => {
  const url = `${BASE_URL}/social-media-posting/oauth/${locationId}/facebook/accounts/${accountId}`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};
