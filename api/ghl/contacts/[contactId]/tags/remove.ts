// pages/api/contacts/[contactId]/tags.ts

import {
  RemoveTagsRequest,
  RemoveTagsResponse
} from '@/types/goHighLevel/tags/remove';
import { AuthHeaders } from '@/types/goHighLevel/task';
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
    // Extract the contactId from the URL
    const { contactId } = req.query;

    if (!contactId || Array.isArray(contactId)) {
      return res
        .status(400)
        .json({
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

    // Construct headers object to match AuthHeaders type
    const headers: AuthHeaders = {
      Authorization: authorization,
      Version: version
    };

    // Validate and parse the request body
    const { tags }: RemoveTagsRequest = req.body;
    if (
      !Array.isArray(tags) ||
      tags.length === 0 ||
      tags.some((tag) => typeof tag !== 'string')
    ) {
      return res
        .status(400)
        .json({
          error:
            'Invalid or missing request body parameter: tags must be a non-empty array of strings'
        });
    }

    // Make the API request to remove tags
    const apiResponse = await fetch(
      `${API_BASE_URL}/contacts/${contactId}/tags`,
      {
        method: 'DELETE',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tags })
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

    const data: RemoveTagsResponse = await apiResponse.json();
    return res.status(200).json(data); // 200 OK
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
