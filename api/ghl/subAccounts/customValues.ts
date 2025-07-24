import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import {
  GetCustomValuesResponse,
  CustomValueRequest,
  CustomValueResponse
} from '@/types/goHighLevel/subAccount/customValue';
import axios from 'axios';

// Get Custom Values
export const getCustomValues = async (
  locationId: string,
  token: string
): Promise<GetCustomValuesResponse> => {
  const url = `${BASE_URL}/locations/${locationId}/customValues`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

// Create Custom Value
export const createCustomValue = async (
  locationId: string,
  token: string,
  customValueData: CustomValueRequest
): Promise<CustomValueResponse> => {
  const url = `${BASE_URL}/locations/${locationId}/customValues`;
  const response = await axios.post(url, customValueData, getHeaders(token));
  return response.data;
};

// Get Custom Value by ID
export const getCustomValueById = async (
  locationId: string,
  customValueId: string,
  token: string
): Promise<CustomValueResponse> => {
  const url = `${BASE_URL}/locations/${locationId}/customValues/${customValueId}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

// Update Custom Value
export const updateCustomValue = async (
  locationId: string,
  customValueId: string,
  token: string,
  customValueData: CustomValueRequest
): Promise<CustomValueResponse> => {
  const url = `${BASE_URL}/locations/${locationId}/customValues/${customValueId}`;
  const response = await axios.put(url, customValueData, getHeaders(token));
  return response.data;
};

// Delete Custom Value
export const deleteCustomValue = async (
  locationId: string,
  customValueId: string,
  token: string
): Promise<{ succeeded: boolean }> => {
  const url = `${BASE_URL}/locations/${locationId}/customValues/${customValueId}`;
  const response = await axios.delete(url, getHeaders(token));
  return response.data;
};
