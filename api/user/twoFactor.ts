import { NextApiRequest, NextApiResponse } from 'next';
import { authenticator } from 'otplib';
import prisma from '../../lib/prisma'; // Adjust the path as needed

// Function to enable 2FA for a user
async function enable2FA(userId: string) {
  // `generateSecret()` returns a base32 string
  const secret = authenticator.generateSecret();

  // Update user's 2FA status in the database
  await prisma.twoFactorAuth.update({
    where: { userProfileId: userId },
    data: {
      isEnabled: true,
      methods: 'authenticatorApp',
      lastEnabledAt: new Date()
    }
  });

  console.log('2FA enabled, secret:', secret);
  return secret;
}

// API route handler for enabling 2FA
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const secret = await enable2FA(userId);
    return res
      .status(200)
      .json({ message: '2FA enabled successfully', secret });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return res.status(500).json({ error: 'Failed to enable 2FA' });
  }
}
