import { AuthHeaders } from '@/types/goHighLevel/task';
import {
  GetUserResponse,
  CreateUserRequest,
  CreateUserResponse
} from '@/types/goHighLevel/users/create';
import type { NextApiRequest, NextApiResponse } from 'next';

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

  const headers: AuthHeaders = {
    Authorization: authorization,
    Version: version
  };

  if (req.method === 'GET') {
    // Get Users by Location
    const { locationId } = req.query;
    if (!locationId || Array.isArray(locationId)) {
      return res
        .status(400)
        .json({ error: 'Invalid or missing query parameter: locationId' });
    }

    try {
      const apiResponse = await fetch(
        `${API_BASE_URL}/users/?locationId=${locationId}`,
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

      const data: GetUserResponse = await apiResponse.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    // Create User
    const {
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
      profilePhoto
    }: CreateUserRequest = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !type ||
      !role ||
      !locationIds ||
      !permissions
    ) {
      return res
        .status(400)
        .json({ error: 'Invalid or missing request body parameters' });
    }

    try {
      const apiResponse = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
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
          profilePhoto
        })
      });

      if (!apiResponse.ok) {
        return res.status(apiResponse.status).json({
          error: `API request failed with status ${apiResponse.status}`
        });
      }

      const data: CreateUserResponse = await apiResponse.json();
      return res.status(201).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
