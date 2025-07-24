import { AuthHeaders } from '@/types/goHighLevel/task';
import {
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserResponse,
  GetUserResponse
} from '@/types/goHighLevel/users/create';
import type { NextApiRequest, NextApiResponse } from 'next';

const API_BASE_URL = 'https://services.leadconnectorhq.com';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query;
  const authorization = req.headers['authorization'];
  const version = req.headers['version'];

  // Validate headers and userId
  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ error: 'Invalid or missing userId' });
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
    // Get User by ID
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
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

      const data: GetUserResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'PUT') {
    // Update User
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      type,
      role,
      companyId,
      locationIds,
      permissions,
      scopes,
      scopesAssignedToOnly,
      profilePhoto,
      emailChangeOTP
    }: UpdateUserRequest = req.body;

    try {
      const apiResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: headers.Authorization,
          Version: headers.Version,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId,
          firstName,
          lastName,
          email,
          password,
          phone,
          type,
          role,
          locationIds,
          permissions,
          scopes,
          scopesAssignedToOnly,
          profilePhoto,
          emailChangeOTP
        })
      });

      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: `API request failed with status ${apiResponse.status}`
        });
      }

      const data: UpdateUserResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'DELETE') {
    // Delete User
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
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

      const data: DeleteUserResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
