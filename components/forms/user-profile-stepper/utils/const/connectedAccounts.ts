import { UserProfile } from '@/types/userProfile';
import {
  FacebookOAuthData,
  InstagramOAuthData,
  LinkedInOAuthData,
  TwitterOAuthData
} from '@/types/userProfile/connectedAccounts';

// CompanyInfo interface to include social media tags
export interface CompanyInfo {
  socialMediaTags?: string[]; // Tags associated with social media campaigns
}

// Interface for Initial OAuth Setup Data
export interface InitialOauthSetupData {
  connectedAccounts: {
    facebook?: FacebookOAuthData | null;
    instagram?: InstagramOAuthData | null;
    linkedIn?: LinkedInOAuthData | null;
    twitter?: TwitterOAuthData | null;
  };
  socialMediaTags: string[]; // Social media tags associated with the company's campaigns
}

// Function to extract both OAuth data and social media tags
export const extractOAuthDataFromUserProfile = (
  profile?: UserProfile // Optional UserProfile type
): InitialOauthSetupData => {
  return {
    connectedAccounts: {
      facebook: profile?.connectedAccounts?.facebook || null,
      instagram: profile?.connectedAccounts?.instagram || null,
      twitter: profile?.connectedAccounts?.twitter || null,
      linkedIn: profile?.connectedAccounts?.linkedIn || null
    },
    socialMediaTags: profile?.companyInfo?.socialMediaTags || [] // Extract social media tags, or use an empty array if not available
  };
};
