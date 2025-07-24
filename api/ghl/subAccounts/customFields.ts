import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import {
  GetCustomFieldsResponse,
  CustomFieldRequest,
  CustomFieldResponse
} from '@/types/goHighLevel/subAccount/customField';
import axios from 'axios';
import { UploadFileResponse } from 'uploadthing/client';

// Get Custom Fields
export const getCustomFields = async (
  locationId: string,
  token: string,
  model?: string
): Promise<GetCustomFieldsResponse> => {
  const url = `${BASE_URL}/locations/${locationId}/customFields${
    model ? `?model=${model}` : ''
  }`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

// Create Custom Field
export const createCustomField = async (
  locationId: string,
  token: string,
  customFieldData: CustomFieldRequest
): Promise<CustomFieldResponse> => {
  const url = `${BASE_URL}/locations/${locationId}/customFields`;
  const response = await axios.post(url, customFieldData, getHeaders(token));
  return response.data;
};

// Get Custom Field by ID
export const getCustomFieldById = async (
  locationId: string,
  customFieldId: string,
  token: string
): Promise<CustomFieldResponse> => {
  const url = `${BASE_URL}/locations/${locationId}/customFields/${customFieldId}`;
  const response = await axios.get(url, getHeaders(token));
  return response.data;
};

// Update Custom Field
export const updateCustomField = async (
  locationId: string,
  customFieldId: string,
  token: string,
  customFieldData: CustomFieldRequest
): Promise<CustomFieldResponse> => {
  const url = `${BASE_URL}/locations/${locationId}/customFields/${customFieldId}`;
  const response = await axios.put(url, customFieldData, getHeaders(token));
  return response.data;
};

// Delete Custom Field
export const deleteCustomField = async (
  locationId: string,
  customFieldId: string,
  token: string
): Promise<{ succeded: boolean }> => {
  const url = `${BASE_URL}/locations/${locationId}/customFields/${customFieldId}`;
  const response = await axios.delete(url, getHeaders(token));
  return response.data;
};

// Upload Files to Custom Field
export const uploadFilesToCustomField = async (
  locationId: string,
  token: string,
  formData: FormData
): Promise<UploadFileResponse> => {
  const url = `${BASE_URL}/locations/${locationId}/customFields/upload`;
  const headers = {
    ...getHeaders(token).headers,
    'Content-Type': 'multipart/form-data'
  };
  const response = await axios.post(url, formData, { headers });
  return response.data;
};
