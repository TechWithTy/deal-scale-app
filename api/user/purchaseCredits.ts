import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma'; // Adjust the path as needed

// Utility function to buy more credits
async function buyCredits(
  subscriptionId: string,
  creditType: 'AICredits' | 'LeadCredits' | 'SkipTraceCredits',
  creditsToBuy: number
) {
  // Update the appropriate credit type
  if (creditType === 'AICredits') {
    // Update AI Credits
    return await prisma.aICredits.update({
      where: { subscriptionId },
      data: {
        allotted: { increment: creditsToBuy }
      }
    });
  } else if (creditType === 'LeadCredits') {
    // Update Lead Credits
    return await prisma.leadCredits.update({
      where: { subscriptionId },
      data: {
        allotted: { increment: creditsToBuy }
      }
    });
  } else if (creditType === 'SkipTraceCredits') {
    // Update Skip Trace Credits
    return await prisma.skipTraceCredits.update({
      where: { subscriptionId },
      data: {
        allotted: { increment: creditsToBuy }
      }
    });
  } else {
    throw new Error('Invalid credit type');
  }
}

// API route handler for buying more credits
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subscriptionId, creditType, creditsToBuy } = req.body;

  // Basic validation
  if (!subscriptionId || !creditType || !creditsToBuy) {
    return res.status(400).json({
      error: 'subscriptionId, creditType, and creditsToBuy are required'
    });
  }

  try {
    // Call the buyCredits function
    const updatedCredits = await buyCredits(
      subscriptionId,
      creditType,
      creditsToBuy
    );

    // Return the updated credit information as the response
    return res.status(200).json({
      message: `Successfully bought ${creditsToBuy} ${creditType} credits`,
      updatedCredits
    });
  } catch (error) {
    // Type guard to handle 'unknown' errors
    if (error instanceof Error) {
      console.error('Error buying credits:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: 'An unknown error occurred' });
  }
}
