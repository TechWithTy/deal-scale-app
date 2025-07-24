// pages/api/contacts/[contactId]/workflow/[workflowId]/index.ts

import { AuthHeaders } from '@/types/goHighLevel/task';
import {
  WorkflowRequest,
  WorkflowActionResponse
} from '@/types/goHighLevel/workflow';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com'; // External API base URL

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { contactId, workflowId } = req.query;

  // Validate path parameters
  if (
    !contactId ||
    Array.isArray(contactId) ||
    !workflowId ||
    Array.isArray(workflowId)
  ) {
    return res.status(400).json({
      error:
        'Missing or invalid path parameters: contactId and workflowId are required'
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

  try {
    if (req.method === 'POST') {
      return await handleAddToWorkflow(
        contactId as string,
        workflowId as string,
        headers,
        req,
        res
      );
    } else if (req.method === 'DELETE') {
      return await handleRemoveFromWorkflow(
        contactId as string,
        workflowId as string,
        headers,
        res
      );
    } else {
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Handle POST request to add a contact to a workflow
async function handleAddToWorkflow(
  contactId: string,
  workflowId: string,
  headers: AuthHeaders,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { eventStartTime }: WorkflowRequest = req.body;

  const apiResponse = await fetch(
    `${API_BASE_URL}/contacts/${contactId}/workflow/${workflowId}`,
    {
      method: 'POST',
      headers: {
        Authorization: headers.Authorization,
        Version: headers.Version,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ eventStartTime })
    }
  );

  if (!apiResponse.ok) {
    return res
      .status(apiResponse.status)
      .json({ error: `API request failed with status ${apiResponse.status}` });
  }

  const data: WorkflowActionResponse = await apiResponse.json();
  return res.status(200).json(data);
}

// Handle DELETE request to remove a contact from a workflow
async function handleRemoveFromWorkflow(
  contactId: string,
  workflowId: string,
  headers: AuthHeaders,
  res: NextApiResponse
) {
  const apiResponse = await fetch(
    `${API_BASE_URL}/contacts/${contactId}/workflow/${workflowId}`,
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

  const data: WorkflowActionResponse = await apiResponse.json();
  return res.status(200).json(data);
}
