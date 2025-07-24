// pages/api/contacts/[contactId]/notes/[id]/index.ts

import {
  NoteResponse,
  NoteRequest,
  DeleteNoteResponse
} from '@/types/goHighLevel/notes';
import { AuthHeaders } from '@/types/goHighLevel/task';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com'; // External API base URL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { contactId, id } = req.query;

  // Validate path parameters
  if (!contactId || Array.isArray(contactId) || !id || Array.isArray(id)) {
    return res.status(400).json({
      error:
        'Missing or invalid path parameters: contactId and note id are required'
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
    return res.status(400).json({ error: 'Missing or invalid Version header' });
  }

  // Construct headers object to match AuthHeaders type
  const headers: AuthHeaders = {
    Authorization: authorization,
    Version: version
  };

  // Handle different HTTP methods
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(contactId as string, id as string, headers, res);
      case 'PUT':
        return await handleUpdate(
          contactId as string,
          id as string,
          headers,
          req,
          res
        );
      case 'DELETE':
        return await handleDelete(
          contactId as string,
          id as string,
          headers,
          res
        );
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Handle GET request to fetch a note
async function handleGet(
  contactId: string,
  id: string,
  headers: AuthHeaders,
  res: NextApiResponse
) {
  const apiResponse = await fetch(
    `${API_BASE_URL}/contacts/${contactId}/notes/${id}`,
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
    return res
      .status(apiResponse.status)
      .json({ error: `API request failed with status ${apiResponse.status}` });
  }

  const data: NoteResponse = await apiResponse.json();
  return res.status(200).json(data);
}

// Handle PUT request to update a note
async function handleUpdate(
  contactId: string,
  id: string,
  headers: AuthHeaders,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, body }: NoteRequest = req.body;

  if (
    !userId ||
    typeof userId !== 'string' ||
    !body ||
    typeof body !== 'string'
  ) {
    return res.status(400).json({
      error:
        'Invalid or missing request body parameters: userId and body are required'
    });
  }

  const apiResponse = await fetch(
    `${API_BASE_URL}/contacts/${contactId}/notes/${id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: headers.Authorization,
        Version: headers.Version,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, body })
    }
  );

  if (!apiResponse.ok) {
    return res
      .status(apiResponse.status)
      .json({ error: `API request failed with status ${apiResponse.status}` });
  }

  const data: NoteResponse = await apiResponse.json();
  return res.status(200).json(data);
}

// Handle DELETE request to delete a note
async function handleDelete(
  contactId: string,
  id: string,
  headers: AuthHeaders,
  res: NextApiResponse
) {
  const apiResponse = await fetch(
    `${API_BASE_URL}/contacts/${contactId}/notes/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: headers.Authorization,
        Version: headers.Version,
        Accept: 'application/json'
      }
    }
  );

  if (!apiResponse.ok) {
    return res
      .status(apiResponse.status)
      .json({ error: `API request failed with status ${apiResponse.status}` });
  }

  const data: DeleteNoteResponse = await apiResponse.json();
  return res.status(200).json(data);
}
