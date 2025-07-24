import axios from 'axios';

interface ListTransactionsParams {
  altId: string;
  altType: string;
  contactId?: string;
  endAt?: string;
  entityId?: string;
  entitySourceSubType?: string;
  entitySourceType?: string;
  limit?: number;
  locationId?: string;
  offset?: number;
  paymentMode?: string;
  search?: string;
  startAt?: string;
  subscriptionId?: string;
  token: string;
}

export const listTransactions = async (
  params: ListTransactionsParams
): Promise<any> => {
  const { altId, altType, token, ...queryParams } = params;

  const url = `/payments/transactions?altId=${altId}&altType=${altType}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28'
    },
    params: queryParams
  });

  return response.data;
};

interface GetTransactionByIdParams {
  transactionId: string;
  altId: string;
  altType: string;
  locationId?: string;
  token: string;
}

export const getTransactionById = async (
  params: GetTransactionByIdParams
): Promise<any> => {
  const { transactionId, altId, altType, locationId, token } = params;

  const url = `/payments/transactions/${transactionId}?altId=${altId}&altType=${altType}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Version: '2021-07-28'
    },
    params: { locationId }
  });

  return response.data;
};
