import { mockUserProfile } from '@/constants/_faker/profile/userProfile';
import {
  NotificationPreferences,
  TwoFactorAuth,
  UserProfile
} from '@/types/userProfile';

export interface InitialProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  personalNum?: string;
  city?: string;
  country?: string;
  twoFactorAuth?: TwoFactorAuth;
  notifications?: NotificationPreferences;
}
export const extractInitialDataFromUserProfile = (
  profile?: UserProfile // Accepting profile as optional
): InitialProfileData => {
  // Fallback to an empty profile-like structure if profile is undefined
  const fallbackProfile: UserProfile = mockUserProfile;

  // Use fallback profile if profile is undefined
  const userProfile = profile || fallbackProfile;

  return {
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    personalNum: userProfile.personalNum, // Extract personalNum from preferred location
    city: userProfile.city,
    country: userProfile.country,

    // Two-Factor Authentication settings
    twoFactorAuth: {
      isEnabled: userProfile.twoFactorAuth?.isEnabled || false,
      methods: {
        sms: userProfile.twoFactorAuth?.methods?.sms || false,
        email: userProfile.twoFactorAuth?.methods?.email || false,
        authenticatorApp:
          userProfile.twoFactorAuth?.methods?.authenticatorApp || false
      },
      lastEnabledAt: userProfile.twoFactorAuth?.lastEnabledAt || null
    },

    // Notification settings
    notifications: {
      emailNotifications:
        userProfile.notificationPreferences?.emailNotifications || false,
      smsNotifications:
        userProfile.notificationPreferences?.smsNotifications || false,
      notifyForNewLeads:
        userProfile.notificationPreferences?.notifyForNewLeads || false,
      notifyForCampaignUpdates:
        userProfile.notificationPreferences?.notifyForCampaignUpdates || false
    }
  };
};
