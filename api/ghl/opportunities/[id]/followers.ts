import {
  AddFollowersRequest,
  AddFollowersResponse
} from '@/types/goHighLevel/opportinity/search';
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

  if (req.method === 'POST') {
    const body: AddFollowersRequest = req.body;

    try {
      const apiResponse = await fetch(
        `${API_BASE_URL}/opportunities/${id}/followers`,
        {
          method: 'POST',
          headers: {
            Authorization: headers.Authorization,
            Version: headers.Version,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: `API request failed with status ${apiResponse.status}`
        });
      }

      const data: AddFollowersResponse = await apiResponse.json();
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
