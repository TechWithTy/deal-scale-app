// pages/api/contacts/bulk/business.ts

import {
  BulkBusinessRequest,
  BulkBusinessResponse
} from '@/types/goHighLevel/bulk/business';
import { AuthHeaders } from '@/types/goHighLevel/task';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com'; // External API base URL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validate that the request method is POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Extract headers (Authorization and Version)
  const authorization = req.headers['authorization'];
  const version = req.headers['version'];

  // Validate required headers
  if (!authorization || Array.isArray(authorization)) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header' });
  }

  if (!version || Array.isArray(version)) {
    return res.status(400).json({ error: 'Missing or invalid Version header' });
  }

  // Construct headers object to match AuthHeaders type
  const headers: AuthHeaders = {
    Authorization: authorization,
    Version: version
  };

  // Validate and parse the request body
  const { locationId, ids, businessId }: BulkBusinessRequest = req.body;

  if (
    !locationId ||
    typeof locationId !== 'string' ||
    !Array.isArray(ids) ||
    ids.length === 0 ||
    (typeof businessId !== 'string' && businessId !== null)
  ) {
    return res.status(400).json({
      error:
        'Invalid or missing request body parameters: locationId, ids, and businessId are required'
    });
  }

  try {
    // Make the API request to add/remove contacts from a business
    const apiResponse = await fetch(`${API_BASE_URL}/contacts/bulk/business`, {
      method: 'POST',
      headers: {
        Authorization: headers.Authorization,
        Version: headers.Version,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ locationId, ids, businessId })
    });

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        error: `API request failed with status ${apiResponse.status}`
      });
    }

    const data: BulkBusinessResponse = await apiResponse.json();
    return res.status(200).json(data); // 200 OK
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
