// pages/api/contacts/[contactId]/tasks.ts

import { GetTasksHeaders, GetTasksResponse } from '@/types/goHighLevel/task';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com'; // External API base URL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Extract the contactId from the URL
    const { contactId } = req.query;

    if (!contactId || Array.isArray(contactId)) {
      return res
        .status(400)
        .json({ error: 'Missing or invalid contactId path parameter' });
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
      return res
        .status(400)
        .json({ error: 'Missing or invalid Version header' });
    }

    // Construct headers object to match GetTasksHeaders type
    const headers: GetTasksHeaders = {
      Authorization: authorization,
      Version: version
    };

    // Make the API request to get tasks
    const apiResponse = await fetch(
      `${API_BASE_URL}/contacts/${contactId}/tasks`,
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

    const data: GetTasksResponse = await apiResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
