import { GetPipelinesResponse } from '@/types/goHighLevel/pipeline';
import { AuthHeaders } from '@/types/goHighLevel/task';
import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authorization = req.headers['authorization'];
  const version = req.headers['version'];
  const locationId = req.query.locationId;

  // Validate headers and locationId
  if (!authorization || Array.isArray(authorization)) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header' });
  }
  if (!version || Array.isArray(version)) {
    return res.status(400).json({ error: 'Missing or invalid Version header' });
  }
  if (!locationId || Array.isArray(locationId)) {
    return res
      .status(400)
      .json({ error: 'Missing or invalid locationId query parameter' });
  }

  const headers: AuthHeaders = {
    Authorization: authorization,
    Version: version
  };

  if (req.method === 'GET') {
    try {
      const apiResponse = await fetch(
        `${API_BASE_URL}/opportunities/pipelines?locationId=${locationId}`,
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

      const data: GetPipelinesResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
