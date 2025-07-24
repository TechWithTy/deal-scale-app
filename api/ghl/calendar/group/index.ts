import {
  GetGroupsQueryParams,
  GetGroupsResponse,
  CreateGroupRequest,
  CreateOrUpdateGroupResponse,
  UpdateGroupRequest,
  ValidateGroupSlugRequest,
  ValidateGroupSlugResponse,
  DeleteGroupResponse,
  DisableGroupRequest
} from '@/types/goHighLevel/calendar/group';
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

// 1. Get Calendar Groups
export const getGroups = async (
  queryParams: GetGroupsQueryParams,
  token: string
): Promise<GetGroupsResponse> => {
  const response = await axios.get(`${BASE_URL}/calendars/groups`, {
    ...getHeaders(token),
    params: queryParams
  });
  return response.data;
};

// 2. Create Calendar Group
export const createGroup = async (
  data: CreateGroupRequest,
  token: string
): Promise<CreateOrUpdateGroupResponse> => {
  const response = await axios.post(
    `${BASE_URL}/calendars/groups`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 3. Update Calendar Group
export const updateGroup = async (
  groupId: string,
  data: UpdateGroupRequest,
  token: string
): Promise<CreateOrUpdateGroupResponse> => {
  const response = await axios.put(
    `${BASE_URL}/calendars/groups/${groupId}`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 4. Validate Group Slug
export const validateGroupSlug = async (
  data: ValidateGroupSlugRequest,
  token: string
): Promise<ValidateGroupSlugResponse> => {
  const response = await axios.post(
    `${BASE_URL}/calendars/groups/validate-slug`,
    data,
    getHeaders(token)
  );
  return response.data;
};

// 5. Delete Group
export const deleteGroup = async (
  groupId: string,
  token: string
): Promise<DeleteGroupResponse> => {
  const response = await axios.delete(
    `${BASE_URL}/calendars/groups/${groupId}`,
    getHeaders(token)
  );
  return response.data;
};

// 6. Disable Group
export const disableGroup = async (
  groupId: string,
  data: DisableGroupRequest,
  token: string
): Promise<DeleteGroupResponse> => {
  const response = await axios.put(
    `${BASE_URL}/calendars/groups/${groupId}/status`,
    data,
    getHeaders(token)
  );
  return response.data;
};
