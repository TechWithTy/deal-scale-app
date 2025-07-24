// pages/api/opportunities/create.ts
import { isError } from '@/api/_utils/isError';
import { createOpportunity } from '@/lib/ghlSchemas/opportunites';
import { CreateOpportunity } from '@/lib/ghlSchemas/opportunites/schema';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = process.env.GHL_TOKEN as string;
    const newOpportunity: CreateOpportunity = req.body;

    // You might want to validate `newOpportunity` using a schema here, similar to previous examples.

    const response = await createOpportunity(accessToken, newOpportunity);
    res.status(200).json(response);
  } catch (error) {
    if (isError(error)) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unknown error occurred' });
    }
  }
}
