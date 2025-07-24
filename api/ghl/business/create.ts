// pages/api/business/create.ts
import { createBusiness } from '@/lib/ghlSchemas/business';
import { BusinessPayloadSchema } from '@/lib/ghlSchemas/business/schema';
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
    const businessPayload = BusinessPayloadSchema.parse(req.body); // Validate the payload

    const data = await createBusiness(accessToken, businessPayload);
    res.status(200).json(data);
  } catch (error) {
    // Assert that error is an instance of Error
    const errorMessage = (error as Error).message;
    res.status(400).json({ error: errorMessage });
  }
}
