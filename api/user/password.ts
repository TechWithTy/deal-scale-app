import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import prisma from '../../lib/prisma'; // Adjust the path as needed

export default async function updatePassword(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res
        .status(400)
        .json({ error: 'userId and newPassword are required' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in securitySettings
    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        securitySettings: {
          update: { password: hashedPassword }
        }
      }
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
}
