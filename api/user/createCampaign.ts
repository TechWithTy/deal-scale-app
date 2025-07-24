import { NextApiRequest, NextApiResponse } from 'next';
import checkAndUpdateCredits from './_utilils/checkCredits'; // Import the credit utility function
import { CallType, CampaignStatus } from '@prisma/client';
import prisma from '../../lib/prisma'; // Import the singleton PrismaClient

// Function to create a campaign based on the campaign type

interface EmailCampaignData {
  senderEmail: string;
  recipientCount: number;
  companyCampaignsUserProfileId: string;
  status?: CampaignStatus;
  name?: string;
  startDate?: Date;
}

interface TextCampaignData {
  phoneNumber: string;
  message: string;
  companyCampaignsUserProfileId: string;
  status?: CampaignStatus;
  name?: string;
  startDate?: Date;
}

interface SocialMediaCampaignData {
  platform: string;
  senderHandle: string;
  receiverHandle: string;
  hashtags: string[];
  companyCampaignsUserProfileId: string;
  status?: CampaignStatus;
  name?: string;
  startDate?: Date;
}

interface CallCampaignData {
  callerNumber: string;
  receiverNumber: string;
  duration: number;
  callType: CallType;
  companyCampaignsUserProfileId: string;
  status?: CampaignStatus;
  name?: string;
  startDate?: Date;
}

type CampaignData =
  | EmailCampaignData
  | TextCampaignData
  | SocialMediaCampaignData
  | CallCampaignData;

async function createCampaign(data: CampaignData, campaignType: string) {
  let campaign;

  switch (campaignType) {
    case 'email':
      campaign = await prisma.emailCampaign.create({
        data: {
          senderEmail: (data as EmailCampaignData).senderEmail,
          recipientCount: (data as EmailCampaignData).recipientCount,
          sentCount: 0,
          deliveredCount: 0,
          status: (data as EmailCampaignData).status ?? CampaignStatus.pending,
          name:
            (data as EmailCampaignData).name || 'Default Email Campaign Name',
          startDate: (data as EmailCampaignData).startDate || new Date(),
          companyCampaignsUserProfile: {
            connect: {
              id: (data as EmailCampaignData).companyCampaignsUserProfileId
            }
          }
        }
      });
      break;

    case 'text':
      campaign = await prisma.textCampaign.create({
        data: {
          phoneNumber: (data as TextCampaignData).phoneNumber,
          message: (data as TextCampaignData).message,
          sentAt: new Date(),
          status: (data as TextCampaignData).status ?? CampaignStatus.pending,
          name: (data as TextCampaignData).name || 'Default Text Campaign Name',
          startDate: (data as TextCampaignData).startDate || new Date(),
          companyCampaignsUserProfile: {
            connect: {
              id: (data as TextCampaignData).companyCampaignsUserProfileId
            }
          }
        }
      });
      break;

    case 'social':
      campaign = await prisma.socialMediaCampaign.create({
        data: {
          platform: (data as SocialMediaCampaignData).platform,
          senderHandle: (data as SocialMediaCampaignData).senderHandle,
          receiverHandle: (data as SocialMediaCampaignData).receiverHandle,
          hashtags: (data as SocialMediaCampaignData).hashtags,
          status:
            (data as SocialMediaCampaignData).status ?? CampaignStatus.pending,
          name:
            (data as SocialMediaCampaignData).name ||
            'Default Social Campaign Name',
          startDate: (data as SocialMediaCampaignData).startDate || new Date(),
          companyCampaignsUserProfile: {
            connect: {
              id: (data as SocialMediaCampaignData)
                .companyCampaignsUserProfileId
            }
          }
        }
      });
      break;

    case 'call':
      campaign = await prisma.callCampaign.create({
        data: {
          callerNumber: (data as CallCampaignData).callerNumber,
          receiverNumber: (data as CallCampaignData).receiverNumber,
          duration: (data as CallCampaignData).duration,
          callType: (data as CallCampaignData).callType,
          status: (data as CallCampaignData).status ?? CampaignStatus.pending,
          name: (data as CallCampaignData).name || 'Default Call Campaign Name',
          startDate: (data as CallCampaignData).startDate || new Date(),
          companyCampaignsUserProfile: {
            connect: {
              id: (data as CallCampaignData).companyCampaignsUserProfileId
            }
          }
        }
      });
      break;

    default:
      throw new Error('Invalid campaign type');
  }

  return campaign;
}

// API route handler for creating different types of campaigns
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    campaignType, // Can be 'email', 'text', 'social', or 'call'
    subscriptionId, // Required for checking credits
    creditsToUse, // The number of credits to use
    ...campaignData // Spread operator to capture the rest of the campaign data
  } = req.body;

  // Basic validation for required fields
  if (!campaignType || !subscriptionId || !creditsToUse) {
    return res.status(400).json({
      error: 'campaignType, subscriptionId, and creditsToUse are required'
    });
  }

  try {
    // Step 1: Check and update credits using the utility function
    await checkAndUpdateCredits(subscriptionId, 'LeadCredits', creditsToUse);

    // Step 2: Create the campaign based on the campaignType
    const campaign = await createCampaign(campaignData, campaignType);

    // Step 3: Return the created campaign as the response
    return res.status(200).json({
      message: `${
        campaignType.charAt(0).toUpperCase() + campaignType.slice(1)
      } campaign created successfully`,
      campaign
    });
  } catch (error) {
    // Typecast error to Error to access the message
    console.error('Error creating campaign:', (error as Error).message);
    return res.status(500).json({
      error: (error as Error).message || 'Failed to create campaign'
    });
  }
}
