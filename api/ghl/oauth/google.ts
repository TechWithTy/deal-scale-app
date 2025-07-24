import { getHeaders } from '@/api/_utils/getHeaders';
import {
  OAuthStartResponse,
  OAuthResponse,
  SetBusinessLocationRequest
} from '@/types/goHighLevel/oauth';
import axios from 'axios';

const BASE_URL = 'https://services.leadconnectorhq.com';

// Starts OAuth for Google
export const startGoogleOAuth = async (
  locationId: string,
  userId: string,
  token: string,
  page?: string,
  reconnect?: string
): Promise<void> => {
  const url = `${BASE_URL}/social-media-posting/oauth/google/start`;
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

// Get Google Business Locations
export const getGoogleBusinessLocations = async (
  locationId: string,
  accountId: string,
  token: string
): Promise<OAuthResponse> => {
  const url = `${BASE_URL}/social-media-posting/oauth/${locationId}/google/locations/${accountId}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

// Set Google Business Locations
export const setGoogleBusinessLocations = async (
  locationId: string,
  accountId: string,
  token: string,
  data: SetBusinessLocationRequest
): Promise<OAuthResponse> => {
  const url = `${BASE_URL}/social-media-posting/oauth/${locationId}/google/locations/${accountId}`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};
