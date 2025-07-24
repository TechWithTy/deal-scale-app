import {
  TaskSearchRequest,
  TaskSearchResponse
} from '@/types/goHighLevel/subAccount/taskSearch';
import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';
const AUTH_HEADER = 'Authorization';

// Helper function to set up headers
const getHeaders = (token: string): AxiosRequestConfig => ({
  headers: {
    [AUTH_HEADER]: `Bearer ${token}`,
    Version: API_VERSION,
    'Content-Type': 'application/json'
  }
});

// 1. Task Search Filter
export const searchTasks = async (
  locationId: string,
  token: string,
  searchParams: TaskSearchRequest
): Promise<TaskSearchResponse> => {
  const response = await axios.post(
    `${BASE_URL}/locations/${locationId}/tasks/search`,
    searchParams,
    getHeaders(token)
  );
  return response.data;
};
