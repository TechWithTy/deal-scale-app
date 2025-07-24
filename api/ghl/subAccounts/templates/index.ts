import { SubAccount } from '@/types/goHighLevel/subAccount';
import { GetTemplatesResponse } from '@/types/goHighLevel/subAccount/templates';
import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';
const AUTH_HEADER = 'Authorization';

// Helper function to set up headers
const getHeaders = (token: string): AxiosRequestConfig => ({
  headers: {
    [AUTH_HEADER]: `Bearer ${token}`,
    Version: API_VERSION
  }
});

// 1. Get All Sub-Accounts
export const getAllSubAccounts = async (
  token: string,
  limit: number = 10,
  order: 'asc' | 'desc' = 'asc',
  skip: number = 0
): Promise<SubAccount[]> => {
  const response = await axios.get(`${BASE_URL}/locations/search`, {
    ...getHeaders(token),
    params: { limit, order, skip }
  });
  return response.data.locations;
};

// 2. Get All Templates for a Sub-Account
export const getTemplates = async (
  locationId: string,
  token: string,
  originId: string,
  deleted: boolean = false,
  limit: number = 25,
  skip: number = 0,
  type?: 'sms' | 'email' | 'whatsapp'
): Promise<GetTemplatesResponse> => {
  const response = await axios.get(
    `${BASE_URL}/locations/${locationId}/templates`,
    {
      ...getHeaders(token),
      params: {
        originId,
        deleted,
        limit,
        skip,
        type
      }
    }
  );
  return response.data;
};

// 3. Delete a Template
export const deleteTemplate = async (
  locationId: string,
  templateId: string,
  token: string
): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/locations/${locationId}/templates/${templateId}`,
    getHeaders(token)
  );
};
