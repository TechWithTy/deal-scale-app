// pages/api/contacts/[contactId]/tasks/[taskId]/completed.ts

import {
  AuthHeaders,
  UpdateTaskCompletedRequest,
  UpdateTaskCompletedResponse
} from '@/types/goHighLevel/task';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com'; // External API base URL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
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
      return res
        .status(400)
        .json({
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

    // Construct headers object to match UpdateTaskCompletedHeaders type
    const headers: AuthHeaders = {
      Authorization: authorization,
      Version: version
    };

    // Validate and parse the request body
    const { completed }: UpdateTaskCompletedRequest = req.body;
    if (typeof completed !== 'boolean') {
      return res
        .status(400)
        .json({
          error:
            'Invalid or missing request body parameter: completed must be a boolean'
        });
    }

    // Make the API request to update the task completion status
    const apiResponse = await fetch(
      `${API_BASE_URL}/contacts/${contactId}/tasks/${taskId}/completed`,
      {
        method: 'PUT',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed })
      }
    );

    // Handle the API response
    if (!apiResponse.ok) {
      return res
        .status(apiResponse.status)
        .json({
          error: `API request failed with status ${apiResponse.status}`
        });
    }

    const data: UpdateTaskCompletedResponse = await apiResponse.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
