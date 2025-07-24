// pages/api/contacts/[contactId]/tasks/[taskId]/index.ts

import { AuthHeaders, DeleteTaskResponse } from '@/types/goHighLevel/task';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com'; // External API base URL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Extract the contactId and taskId from the URL
    const { contactId, taskId } = req.query;

    if (
      !contactId ||
      Array.isArray(contactId) ||
      !taskId ||
      Array.isArray(taskId)
    ) {
      return res.status(400).json({
        error:
          'Missing or invalid path parameters: contactId and taskId are required'
      });
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

    // Construct headers object to match DeleteTaskHeaders type
    const headers: AuthHeaders = {
      Authorization: authorization,
      Version: version
    };

    // Make the API request to delete the task
    const apiResponse = await fetch(
      `${API_BASE_URL}/contacts/${contactId}/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version,
          Accept: 'application/json'
        }
      }
    );

    // Handle the API response
    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        error: `API request failed with status ${apiResponse.status}`
      });
    }

    const data: DeleteTaskResponse = await apiResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
