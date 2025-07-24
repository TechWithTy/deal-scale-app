// pages/api/business/delete.ts
import { isError } from '@/api/_utils/isError';
import { deleteBusiness } from '@/lib/ghlSchemas/business';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = process.env.GHL_TOKEN as string;
    const businessId = req.query.id as string;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const data = await deleteBusiness(accessToken, businessId);
    res.status(200).json(data);
  } catch (error) {
    if (isError(error)) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
}
