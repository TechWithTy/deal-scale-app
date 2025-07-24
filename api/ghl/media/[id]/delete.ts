import {
  DeleteFileOrFolderQueryParams,
  DeleteFileResponse
} from '@/types/goHighLevel/media';
import { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const authorization = req.headers['authorization'];
  const version = req.headers['version'];

  // Extract and validate query parameters
  const { altId, altType } =
    req.query as Partial<DeleteFileOrFolderQueryParams>;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid or missing file/folder id' });
  }
  if (!authorization || Array.isArray(authorization)) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header' });
  }
  if (!version || Array.isArray(version)) {
    return res.status(400).json({ error: 'Missing or invalid Version header' });
  }
  if (!altId || !altType || (altType !== 'agency' && altType !== 'location')) {
    return res.status(400).json({
      error:
        'Missing or invalid query parameters: altId and altType are required'
    });
  }

  const headers = {
    Authorization: authorization,
    Version: version
  };

  if (req.method === 'DELETE') {
    try {
      const apiResponse = await fetch(
        `${API_BASE_URL}/medias/${id}?altId=${altId}&altType=${altType}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: headers.Authorization,
            Version: headers.Version
          }
        }
      );

      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: `API request failed with status ${apiResponse.status}`
        });
      }

      const data: DeleteFileResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
