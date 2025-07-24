import axios from 'axios';

interface ListSubscriptionsParams {
  altId: string;
  altType: string;
  contactId?: string;
  endAt?: string;
  entityId?: string;
  entitySourceType?: string;
  id?: string;
  limit?: number;
  offset?: number;
  paymentMode?: string;
  search?: string;
  startAt?: string;
  token: string;
}

export const listSubscriptions = async (
  params: ListSubscriptionsParams
): Promise<any> => {
  const { altId, altType, token, ...queryParams } = params;

  const url = `/payments/subscriptions?altId=${altId}&altType=${altType}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28'
    },
    params: queryParams
  });

  return response.data;
};

interface GetSubscriptionByIdParams {
  subscriptionId: string;
  altId: string;
  altType: string;
  token: string;
}

export const getSubscriptionById = async (
  params: GetSubscriptionByIdParams
): Promise<any> => {
  const { subscriptionId, altId, altType, token } = params;

  const url = `/payments/subscriptions/${subscriptionId}?altId=${altId}&altType=${altType}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28'
    }
  });

  return response.data;
};
