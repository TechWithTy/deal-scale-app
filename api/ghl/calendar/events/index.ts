import { GetAppointmentResponse } from '@/types/goHighLevel/calendar/appointments';
import { GetCalendarEventsResponse } from '@/types/goHighLevel/calendar/calendarEvents';
import {
  GetCalendarEventsQueryParams,
  CreateOrUpdateEventRequest,
  CreateOrUpdateEventResponse,
  BlockSlotRequest,
  DeleteEventResponse
} from '@/types/goHighLevel/calendar/event';
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

// 1. Get Calendar Events
export const getCalendarEvents = async (
  queryParams: GetCalendarEventsQueryParams,
  token: string
): Promise<GetCalendarEventsResponse> => {
  const response = await axios.get(`${BASE_URL}/calendars/events`, {
    ...getHeaders(token),
    params: queryParams
  });
  return response.data;
};

// 2. Create Appointment
export const createAppointment = async (
  data: CreateOrUpdateEventRequest,
  token: string
): Promise<CreateOrUpdateEventResponse> => {
  const response = await axios.post(
    `${BASE_URL}/calendars/events/appointments`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 3. Update Appointment
export const updateAppointment = async (
  eventId: string,
  data: CreateOrUpdateEventRequest,
  token: string
): Promise<CreateOrUpdateEventResponse> => {
  const response = await axios.put(
    `${BASE_URL}/calendars/events/appointments/${eventId}`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 4. Get Appointment by ID
export const getAppointment = async (
  eventId: string,
  token: string
): Promise<GetAppointmentResponse> => {
  const response = await axios.get(
    `${BASE_URL}/calendars/events/appointments/${eventId}`,
    getHeaders(token)
  );
  return response.data;
};

// 5. Create Block Slot
export const createBlockSlot = async (
  data: BlockSlotRequest,
  token: string
): Promise<CreateOrUpdateEventResponse> => {
  const response = await axios.post(
    `${BASE_URL}/calendars/events/block-slots`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 6. Update Block Slot
export const updateBlockSlot = async (
  eventId: string,
  data: BlockSlotRequest,
  token: string
): Promise<CreateOrUpdateEventResponse> => {
  const response = await axios.put(
    `${BASE_URL}/calendars/events/block-slots/${eventId}`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 7. Delete Event
export const deleteEvent = async (
  eventId: string,
  token: string
): Promise<DeleteEventResponse> => {
  const response = await axios.delete(
    `${BASE_URL}/calendars/events/${eventId}`,
    getHeaders(token)
  );
  return response.data;
};
