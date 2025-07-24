import { UploadFileRequest } from '@/types/goHighLevel/media';
import { NextApiRequest, NextApiResponse } from 'next';
import { UploadFileResponse } from 'uploadthing/client';

const API_BASE_URL = 'https://services.leadconnectorhq.com';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authorization = req.headers['authorization'];
  const version = req.headers['version'];

  // Validate headers
  if (!authorization || Array.isArray(authorization)) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header' });
  }
  if (!version || Array.isArray(version)) {
    return res.status(400).json({ error: 'Missing or invalid Version header' });
  }

  const headers = {
    Authorization: authorization,
    Version: version
  };

  if (req.method === 'POST') {
    // Handle file upload
    const { file, hosted, fileUrl, name }: UploadFileRequest = req.body;

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (hosted !== undefined) {
        formData.append('hosted', hosted.toString());
      }
      if (fileUrl) {
        formData.append('fileUrl', fileUrl);
      }
      formData.append('name', name);

      const apiResponse = await fetch(`${API_BASE_URL}/medias/upload-file`, {
        method: 'POST',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version
          // Automatically handled by FormData
        },
        body: formData
      });

      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: `API request failed with status ${apiResponse.status}`
        });
      }

      const data: UploadFileResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
