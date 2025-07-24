import {
  CreateOpportunity,
  CreateOpportunitySchema,
  SearchOpportunitiesQuery
} from './schema';

const url = 'https://services.leadconnectorhq.com/opportunities';

const createHeaders = (accessToken: string): HeadersInit => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Version: '2021-07-28'
});

export const searchOpportunities = async (
  accessToken: string,
  query: SearchOpportunitiesQuery
) => {
  const reqUrl = new URL(`${url}/search/`);

  // Construct query parameters using URLSearchParams
  const queryParams = new URLSearchParams();

  // Assuming query is an object with properties that need to be added as query parameters
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(`${reqUrl}?${queryParams}`, {
    method: 'GET',
    headers: createHeaders(accessToken)
  });

  // Handle the response without using handleGoHighLevelError
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch opportunities: ${response.status} ${errorText}`
    );
  }

  const responseJson = await response.json();
  return responseJson.opportunities;
};

export const createOpportunity = async (
  accessToken: string,
  data: CreateOpportunity
) => {
  const parsedData = CreateOpportunitySchema.safeParse(data);

  if (!parsedData.success) {
    throw new Error(`Invalid data: ${parsedData.error.message}`);
  }

  const response = await fetch(`${url}/`, {
    method: 'POST',
    headers: createHeaders(accessToken),
    body: JSON.stringify(data)
  });

  // Handle the response without using handleGoHighLevelError
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create opportunity: ${response.status} ${errorText}`
    );
  }

  const responseJson = await response.json();
  return responseJson.opportunity;
};
