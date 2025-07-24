import { BASE_URL, getHeaders } from '@/api/_utils/getHeaders';
import axios from 'axios';
/**
 * Get locations by Stripe customer ID or subscription ID and company ID.
 * @param token - Access token.
 * @param companyId - The company ID.
 * @param customerId - The Stripe customer ID.
 * @param subscriptionId - The Stripe subscription ID.
 * @returns A Promise containing the locations data.
 */
export const getLocationsByStripeId = async (
  token: string,
  companyId: string,
  customerId: string,
  subscriptionId: string
): Promise<any> => {
  const url = `${BASE_URL}/saas-api/public-api/locations`;
  const params = new URLSearchParams({
    companyId,
    customerId,
    subscriptionId
  });

  const response = await axios.get(
    `${url}?${params.toString()}`,
    getHeaders(token)
  );
  return response.data;
};

interface UpdateSaaSSubscriptionRequest {
  subscriptionId: string;
  customerId: string;
  companyId: string;
}

/**
 * Update SaaS subscription for a given location ID.
 * @param token - Access token.
 * @param locationId - The location ID.
 * @param data - Request body for updating the subscription.
 * @returns A Promise containing the response data.
 */
export const updateSaaSSubscription = async (
  token: string,
  locationId: string,
  data: UpdateSaaSSubscriptionRequest
): Promise<any> => {
  const url = `${BASE_URL}/saas-api/public-api/update-saas-subscription/${locationId}`;
  const response = await axios.put(url, data, getHeaders(token));
  return response.data;
};

/**
 * Disable SaaS for multiple locations by company ID.
 * @param token - Access token.
 * @param companyId - The company ID.
 * @param locationIds - Array of location IDs to disable SaaS for.
 * @returns A Promise containing the response data.
 */
export const disableSaaSForLocations = async (
  token: string,
  companyId: string,
  locationIds: string[]
): Promise<any> => {
  const url = `${BASE_URL}/saas-api/public-api/bulk-disable-saas/${companyId}`;
  const response = await axios.post(url, { locationIds }, getHeaders(token));
  return response.data;
};

interface EnableSaaSRequest {
  stripeAccountId: string;
  name: string;
  email: string;
  stripeCustomerId: string;
  companyId: string;
}

/**
 * Enable SaaS for a given location ID.
 * @param token - Access token.
 * @param locationId - The location ID.
 * @param data - Request body to enable SaaS.
 * @returns A Promise containing the response data.
 */
export const enableSaaSForLocation = async (
  token: string,
  locationId: string,
  data: EnableSaaSRequest
): Promise<any> => {
  const url = `${BASE_URL}/saas-api/public-api/enable-saas/${locationId}`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};

interface PauseLocationRequest {
  paused: boolean;
  companyId: string;
}

/**
 * Pause a sub-account for a given location ID.
 * @param token - Access token.
 * @param locationId - The location ID.
 * @param data - Request body to pause the location.
 * @returns A Promise containing the response data.
 */
export const pauseLocation = async (
  token: string,
  locationId: string,
  data: PauseLocationRequest
): Promise<any> => {
  const url = `${BASE_URL}/saas-api/public-api/pause/${locationId}`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};

interface RebillingConfig {
  optIn: boolean;
  enabled: boolean;
  markup: number;
}

interface UpdateRebillingRequest {
  product:
    | 'contentAI'
    | 'workflow_premium_actions'
    | 'workflow_ai'
    | 'conversationAI'
    | 'whatsApp'
    | 'reviewsAI'
    | 'Phone'
    | 'Email';
  locationIds: string[];
  config: RebillingConfig;
}

/**
 * Bulk update rebilling for given location IDs.
 * @param token - Access token.
 * @param companyId - The company ID.
 * @param data - Request body for updating rebilling.
 * @returns A Promise containing the response data.
 */
export const updateRebilling = async (
  token: string,
  companyId: string,
  data: UpdateRebillingRequest
): Promise<any> => {
  const url = `${BASE_URL}/saas-api/public-api/update-rebilling/${companyId}`;
  const response = await axios.post(url, data, getHeaders(token));
  return response.data;
};
