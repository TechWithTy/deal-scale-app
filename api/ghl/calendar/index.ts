import {
  GetFreeSlotsQueryParams,
  GetFreeSlotsResponse,
  UpdateCalendarRequest,
  CreateOrUpdateCalendarResponse,
  CreateCalendarRequest,
  DeleteCalendarResponse,
  GetCalendarsResponse
} from '@/types/goHighLevel/calendar';
import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-04-15';
const AUTH_HEADER = 'Authorization'; // Change as needed

// Helper function to set up headers
const getHeaders = (token: string): AxiosRequestConfig => ({
  headers: {
    [AUTH_HEADER]: `Bearer ${token}`,
    Version: API_VERSION
  }
});

// 1. Get Free Slots
export const getFreeSlots = async (
  calendarId: string,
  queryParams: GetFreeSlotsQueryParams,
  token: string
): Promise<GetFreeSlotsResponse> => {
  const response = await axios.get(
    `${BASE_URL}/calendars/${calendarId}/free-slots`,
    {
      ...getHeaders(token),
      params: queryParams
    }
  );
  return response.data;
};

// 2. Update Calendar
export const updateCalendar = async (
  calendarId: string,
  data: UpdateCalendarRequest,
  token: string
): Promise<CreateOrUpdateCalendarResponse> => {
  const response = await axios.put(
    `${BASE_URL}/calendars/${calendarId}`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 3. Create Calendar
export const createCalendar = async (
  data: CreateCalendarRequest,
  token: string
): Promise<CreateOrUpdateCalendarResponse> => {
  const response = await axios.post(
    `${BASE_URL}/calendars/`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 4. Get Calendar by ID
export const getCalendarById = async (
  calendarId: string,
  token: string
): Promise<CreateOrUpdateCalendarResponse> => {
  const response = await axios.get(
    `${BASE_URL}/calendars/${calendarId}`,
    getHeaders(token)
  );
  return response.data;
};

// 5. Delete Calendar
export const deleteCalendar = async (
  calendarId: string,
  token: string
): Promise<DeleteCalendarResponse> => {
  const response = await axios.delete(
    `${BASE_URL}/calendars/${calendarId}`,
    getHeaders(token)
  );
  return response.data;
};

// 6. Get All Calendars in a Location
export const getCalendars = async (
  locationId: string,
  token: string,
  groupId?: string,
  showDrafted: boolean = true
): Promise<GetCalendarsResponse> => {
  const response = await axios.get(`${BASE_URL}/calendars/`, {
    ...getHeaders(token),
    params: { locationId, groupId, showDrafted }
  });
  return response.data;
};
