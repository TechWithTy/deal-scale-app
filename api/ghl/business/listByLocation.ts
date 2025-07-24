// pages/api/business/listByLocation.ts
import { isError } from '@/api/_utils/isError';
import { getBusinessesByLocation } from '@/lib/ghlSchemas/business';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = process.env.GHL_TOKEN as string;
    const locationId = req.query.locationId as string;

    if (!locationId) {
      return res.status(400).json({ error: 'Location ID is required' });
    }

    const data = await getBusinessesByLocation(accessToken, locationId);
    res.status(200).json(data);
  } catch (error) {
    if (isError(error)) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
}
