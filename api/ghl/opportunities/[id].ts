import {
  GetOpportunityResponse,
  UpdateOpportunityRequest,
  UpdateOpportunityResponse,
  DeleteOpportunityResponse
} from '@/types/goHighLevel/opportinity';
import { AuthHeaders } from '@/types/goHighLevel/task';
import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const authorization = req.headers['authorization'];
  const version = req.headers['version'];

  // Validate headers and id
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid or missing opportunity id' });
  }
  if (!authorization || Array.isArray(authorization)) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header' });
  }
  if (!version || Array.isArray(version)) {
    return res.status(400).json({ error: 'Missing or invalid Version header' });
  }

  const headers: AuthHeaders = {
    Authorization: authorization,
    Version: version
  };

  if (req.method === 'GET') {
    // Get Opportunity
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
        method: 'GET',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version,
          Accept: 'application/json'
        }
      });

      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: `API request failed with status ${apiResponse.status}`
        });
      }

      const data: GetOpportunityResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'PUT') {
    // Update Opportunity
    const body: UpdateOpportunityRequest = req.body;

    try {
      const apiResponse = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: `API request failed with status ${apiResponse.status}`
        });
      }

      const data: UpdateOpportunityResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'DELETE') {
    // Delete Opportunity
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/opportunities/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version
        }
      });

      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: `API request failed with status ${apiResponse.status}`
        });
      }

      const data: DeleteOpportunityResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
