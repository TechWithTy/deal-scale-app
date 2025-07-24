// pages/api/workflows/index.ts

import { AuthHeaders } from '@/types/goHighLevel/task';
import { GetWorkflowResponse } from '@/types/goHighLevel/workflow';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com'; // External API base URL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Validate that the request method is GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
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

  // Extract query parameters
  const { locationId } = req.query;

  // Validate required query parameter
  if (!locationId || Array.isArray(locationId)) {
    return res.status(400).json({
      error: 'Missing or invalid query parameter: locationId is required'
    });
  }

  try {
    // Make the API request to get workflows
    const apiResponse = await fetch(
      `${API_BASE_URL}/workflows/?locationId=${locationId}`,
      {
        method: 'GET',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version,
          Accept: 'application/json'
        }
      }
    );

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        error: `API request failed with status ${apiResponse.status}`
      });
    }

    const data: GetWorkflowResponse = await apiResponse.json();
    return res.status(200).json(data); // 200 OK
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
