// pages/api/contacts/[contactId]/tasks/index.ts

import {
  AuthHeaders,
  TaskRequest,
  TaskResponse
} from '@/types/goHighLevel/task';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com'; // External API base URL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Extract the contactId from the URL
    const { contactId } = req.query;

    if (!contactId || Array.isArray(contactId)) {
      return res.status(400).json({
        error: 'Missing or invalid path parameter: contactId is required'
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

    // Construct headers object to match CreateTaskHeaders type
    const headers: AuthHeaders = {
      Authorization: authorization,
      Version: version
    };

    // Validate and parse the request body
    const { title, body, dueDate, completed, assignedTo }: TaskRequest =
      req.body;
    if (
      !title ||
      !body ||
      !dueDate ||
      typeof completed !== 'boolean' ||
      !assignedTo
    ) {
      return res
        .status(400)
        .json({ error: 'Invalid or missing request body parameters' });
    }

    // Make the API request to create the task
    const apiResponse = await fetch(
      `${API_BASE_URL}/contacts/${contactId}/tasks`,
      {
        method: 'POST',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, body, dueDate, completed, assignedTo })
      }
    );

    // Handle the API response
    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        error: `API request failed with status ${apiResponse.status}`
      });
    }

    const data: TaskResponse = await apiResponse.json();
    return res.status(201).json(data); // 201 Created
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
