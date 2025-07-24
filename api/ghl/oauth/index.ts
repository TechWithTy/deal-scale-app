import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import { OAuthResponse } from '@/types/goHighLevel/oauth';
import axios from 'axios';

export const getAccounts = async (
  locationId: string,
  token: string
): Promise<OAuthResponse> => {
  const url = `${BASE_URL}/social-media-posting/${locationId}/accounts`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

export const deleteAccount = async (
  locationId: string,
  accountId: string,
  token: string,
  companyId?: string,
  userId?: string
): Promise<OAuthResponse> => {
  const url = `${BASE_URL}/social-media-posting/${locationId}/accounts/${accountId}`;

  // Add optional query parameters if provided
  const params = new URLSearchParams();
  if (companyId) params.append('companyId', companyId);
  if (userId) params.append('userId', userId);

  const response = await axios.delete(
    `${url}?${params.toString()}`,
    getHeaders(token)
  );
  return response.data;
};
