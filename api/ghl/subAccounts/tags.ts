import {
  GetTagsResponse,
  CreateOrUpdateTagRequest,
  GetTagResponse
} from '@/types/goHighLevel/subAccount/tags';
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

// 1. Get all tags for a Sub-Account
export const getTags = async (
  locationId: string,
  token: string
): Promise<GetTagsResponse> => {
  const response = await axios.get(
    `${BASE_URL}/locations/${locationId}/tags`,
    getHeaders(token)
  );
  return response.data;
};

// 2. Create a new tag for a Sub-Account
export const createTag = async (
  locationId: string,
  token: string,
  tagData: CreateOrUpdateTagRequest
): Promise<GetTagResponse> => {
  const response = await axios.post(
    `${BASE_URL}/locations/${locationId}/tags`,
    tagData,
    {
      ...getHeaders(token),
      headers: {
        ...getHeaders(token).headers,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// 3. Get a specific tag by ID
export const getTagById = async (
  locationId: string,
  tagId: string,
  token: string
): Promise<GetTagResponse> => {
  const response = await axios.get(
    `${BASE_URL}/locations/${locationId}/tags/${tagId}`,
    getHeaders(token)
  );
  return response.data;
};

// 4. Update a tag by ID
export const updateTag = async (
  locationId: string,
  tagId: string,
  token: string,
  tagData: CreateOrUpdateTagRequest
): Promise<GetTagResponse> => {
  const response = await axios.put(
    `${BASE_URL}/locations/${locationId}/tags/${tagId}`,
    tagData,
    {
      ...getHeaders(token),
      headers: {
        ...getHeaders(token).headers,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// 5. Delete a tag by ID
export const deleteTag = async (
  locationId: string,
  tagId: string,
  token: string
): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/locations/${locationId}/tags/${tagId}`,
    getHeaders(token)
  );
};
