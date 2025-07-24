import { UserProfile } from '@/types/userProfile';

export interface InitialBaseSetupData {
  companyName?: string;
  companyLogo?: File | string;
  outreachEmailAddress?: string;
  leadForwardingNumber?: string;
  companyExplainerVideoUrl?: string;
  companyAssets?: Array<File | string>; // Array of files or URLs
}

export const extractInitialBaseDataFromUserProfile = (
  profile?: UserProfile // Allow the profile to be optional by using '?'
): InitialBaseSetupData => {
  if (!profile) {
    return {}; // Return an empty object if the profile is undefined
  }

  return {
    companyName: profile.companyInfo?.companyName || '', // Extract company name
    companyLogo: profile.companyInfo?.assets?.logo || '', // Extract company logo
    outreachEmailAddress: profile.companyInfo?.outreachEmail || '', // Extract outreach email
    leadForwardingNumber: profile.companyInfo?.forwardingNumber || '', // Extract forwarding number
    companyExplainerVideoUrl: profile.companyInfo?.explainerVideo || '', // Extract explainer video URL
    companyAssets: [
      profile.companyInfo?.assets?.logo,
      profile.companyInfo?.assets?.favicon,
      profile.companyInfo?.assets?.banner,
      profile.companyInfo?.assets?.ghlAssets
    ].filter(Boolean) as Array<File | string> // Filter out any undefined/null values
  };
};
