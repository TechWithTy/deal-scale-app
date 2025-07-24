import {
  SubAccount,
  CreateOrUpdateSubAccountRequest,
  DeleteSubAccountResponse
} from '@/types/goHighLevel/subAccount';
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

// 1. Get Sub-Account by ID
export const getSubAccount = async (
  locationId: string,
  token: string
): Promise<SubAccount> => {
  const response = await axios.get(
    `${BASE_URL}/locations/${locationId}`,
    getHeaders(token)
  );
  return response.data.location;
};

// 2. Create Sub-Account
export const createSubAccount = async (
  data: CreateOrUpdateSubAccountRequest,
  token: string
): Promise<SubAccount> => {
  const response = await axios.post(
    `${BASE_URL}/locations/`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 3. Update Sub-Account by ID
export const updateSubAccount = async (
  locationId: string,
  data: CreateOrUpdateSubAccountRequest,
  token: string
): Promise<SubAccount> => {
  const response = await axios.put(
    `${BASE_URL}/locations/${locationId}`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 4. Delete Sub-Account by ID
export const deleteSubAccount = async (
  locationId: string,
  deleteTwilioAccount: boolean,
  token: string
): Promise<DeleteSubAccountResponse> => {
  const response = await axios.delete(`${BASE_URL}/locations/${locationId}`, {
    ...getHeaders(token),
    params: {
      deleteTwilioAccount
    }
  });
  return response.data;
};
