import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import prisma from '../../lib/prisma'; // Adjust the path as needed

// Initialize Stripe client
const stripe = new Stripe('your-stripe-secret-key', {
  apiVersion: '2024-06-20'
});

export default async function upgradeSubscription(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userProfileId, newPlanId } = req.body;

    if (!userProfileId || !newPlanId) {
      return res
        .status(400)
        .json({ error: 'userProfileId and newPlanId are required' });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userProfileId },
      include: { subscription: true }
    });

    if (!userProfile || !userProfile.subscription) {
      return res.status(404).json({ error: 'User or subscription not found' });
    }

    const subscription = await stripe.subscriptions.update(
      userProfile.subscription.stripeSubscriptionID,
      {
        items: [{ plan: newPlanId }]
      }
    );

    await prisma.userProfileSubscription.update({
      where: { userProfileId },
      data: {
        stripeSubscriptionID: subscription.id,
        name: subscription.items.data[0].plan.nickname || 'Updated Plan'
      }
    });

    return res.status(200).json({
      message: 'Subscription upgraded successfully',
      subscription
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
}
