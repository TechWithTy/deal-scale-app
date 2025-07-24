import {
  GetCalendarResourceResponse,
  CreateOrUpdateResourceRequest,
  CalendarResource,
  DeleteCalendarResourceResponse,
  ListCalendarResourcesParams,
  ListCalendarResourcesResponse
} from '@/types/goHighLevel/calendar/resource';
import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-04-15';
const AUTH_HEADER = 'Authorization';

// Helper function to set up headers
const getHeaders = (token: string): AxiosRequestConfig => ({
  headers: {
    [AUTH_HEADER]: `Bearer ${token}`,
    Version: API_VERSION
  }
});

// 1. Get Calendar Resource by ID
export const getCalendarResource = async (
  resourceType: 'equipments' | 'rooms',
  id: string,
  token: string
): Promise<GetCalendarResourceResponse> => {
  const response = await axios.get(
    `${BASE_URL}/calendars/resources/${resourceType}/${id}`,
    getHeaders(token)
  );
  return response.data;
};

// 2. Create Calendar Resource
export const createCalendarResource = async (
  resourceType: 'equipments' | 'rooms',
  data: CreateOrUpdateResourceRequest,
  token: string
): Promise<CalendarResource> => {
  const response = await axios.post(
    `${BASE_URL}/calendars/resources/${resourceType}`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 3. Update Calendar Resource by ID
export const updateCalendarResource = async (
  resourceType: 'equipments' | 'rooms',
  id: string,
  data: CreateOrUpdateResourceRequest,
  token: string
): Promise<CalendarResource> => {
  const response = await axios.put(
    `${BASE_URL}/calendars/resources/${resourceType}/${id}`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 4. Delete Calendar Resource by ID
export const deleteCalendarResource = async (
  resourceType: 'equipments' | 'rooms',
  id: string,
  token: string
): Promise<DeleteCalendarResourceResponse> => {
  const response = await axios.delete(
    `${BASE_URL}/calendars/resources/${resourceType}/${id}`,
    getHeaders(token)
  );
  return response.data;
};

// 5. List Calendar Resources
export const listCalendarResources = async (
  resourceType: 'equipments' | 'rooms',
  params: ListCalendarResourcesParams,
  token: string
): Promise<ListCalendarResourcesResponse> => {
  const response = await axios.get(
    `${BASE_URL}/calendars/resources/${resourceType}`,
    {
      ...getHeaders(token),
      params
    }
  );
  return response.data;
};
