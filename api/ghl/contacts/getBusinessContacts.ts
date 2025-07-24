// pages/api/contacts.ts

import {
  GetContactsListQueryParams,
  GetContactsListHeaders,
  GetContactsListResponse
} from '@/types/goHighLevel/contact/contactList';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL =
  'https://services.leadconnectorhq.com/contacts/business/{businessId}'; // Replace with the actual base URL of the API

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Extract query parameters from the request
    const {
      locationId,
      limit = 25,
      query,
      startAfter,
      startAfterId
    }: Partial<GetContactsListQueryParams> = req.query;

    // Validate required parameters
    if (!locationId || Array.isArray(locationId)) {
      return res.status(400).json({
        error: 'Missing or invalid required query parameter: locationId'
      });
    }

    // Extract headers (Authorization and Version)
    const authorization = req.headers['authorization'];
    const version = req.headers['version'];

    // Validate required headers and handle possible types
    if (!authorization || Array.isArray(authorization)) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid Authorization header' });
    }

    if (!version || Array.isArray(version)) {
      return res
        .status(400)
        .json({ error: 'Missing or invalid Version header' });
    }

    // Construct headers object to match GetContactsListHeaders type
    const headers: GetContactsListHeaders = {
      Authorization: authorization,
      Version: version
    };

    // Construct the query string for the API call
    const queryParams = new URLSearchParams();
    queryParams.append('locationId', locationId);
    if (limit) queryParams.append('limit', limit.toString());
    if (query) queryParams.append('query', query);
    if (startAfter) queryParams.append('startAfter', startAfter.toString());
    if (startAfterId) queryParams.append('startAfterId', startAfterId);

    // Make the API request to get contacts
    const apiResponse = await fetch(
      `${API_BASE_URL}/contacts?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version
        }
      }
    );

    // Handle the API response
    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        error: `API request failed with status ${apiResponse.status}`
      });
    }

    const data: GetContactsListResponse = await apiResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
