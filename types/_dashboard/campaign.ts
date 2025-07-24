import { EmailCampaign } from '../goHighLevel/email';
import { GHLTextMessageCampaign } from '../goHighLevel/text';
import { GetCallResponse } from '../vapiAi/api/calls/get';
import { EndedReason } from '../vapiAi/api/calls/_enums';

// Common fields for all campaigns
export interface CampaignBase {
  id: string;
  name: string;
  goal?: string;
  status:
    | 'delivered'
    | 'delivering'
    | 'failed'
    | 'pending'
    | 'completed'
    | 'missed'
    | 'queued'
    | 'read'
    | 'unread';
  startDate: string;
  endDate?: string;
  aiVoice?: string;
  aiScript?: string;
  updatedAt?: string;
  aiAvatarAgent?: string;
}

export const campaignStatusesGB: CampaignBase['status'][] = [
  'queued',
  'delivered',
  'delivering',
  'failed',
  'pending',
  'completed',
  'missed',
  'read',
  'unread'
];
// Specific types for Text Campaigns

// CallInfo object to encapsulate call response, contact ID, and campaign ID
export interface CallInfo {
  callResponse: GetCallResponse; // The VAPI call response
  contactId: string; // Unique identifier for the contact associated with the call
  campaignId: string; // Unique identifier for the campaign associated with the call
}
// Specific types for Call Campaigns
export interface CallCampaign extends CampaignBase {
  callInformation: CallInfo[];
  callerNumber: string;
  receiverNumber: string;
  duration: number; // in seconds
  callType: 'inbound' | 'outbound';
  timestamp?: Date; // Add this if `timestamp` is needed for tracking
  // Additional fields specific to the call campaign
  calls: number;
  inQueue: number;
  leads: number;
  voicemail: number;
  hungUp: number;
  dead: number;
  wrongNumber: number;
  inactiveNumbers: number;
  dnc: number;
  scriptID?: string;
  funnelID?: string;
  workflowID?: string;
}
export type BaseAction = {
  status: 'pending' | 'successful' | 'failed'; // Status of each action
  attempt: number; // Number of attempts
  successful: number; // Number of successful executions
  failed: number; // Number of failed executions
  viewLink: string; // Link to view details of the action
};

// Twitter-specific actions
export type TwitterAction = BaseAction & {
  type: 'Like' | 'Follow' | 'Retweet' | '📩 Followers'; // Twitter-specific actions
  replyMessage?: string; // Only available for specific Twitter actions (e.g., 📩 Followers)
};

// LinkedIn-specific actions
export type LinkedInAction = BaseAction & {
  type:
    | 'Connect'
    | 'Connect & Follow Up'
    | 'Message'
    | 'Invite to Follow'
    | 'Comment'
    | 'Like'
    | '📩 Connections'
    | '📩 Groups'; // LinkedIn-specific actions
  replyMessage?: string; // Only available for message-related actions (e.g., Message, Connect & Follow Up)
};

// Instagram-specific actions
export type InstagramAction = BaseAction & {
  type: 'Like' | 'Follow' | 'Comment' | '👁️ Story'; // Instagram-specific actions
};

// Union of all actions
export type SocialAction = TwitterAction | LinkedInAction | InstagramAction;
// Specific types for DM Campaigns

export interface SocialMediaCampaign extends CampaignBase {
  id: string; // Campaign ID
  platform: 'Facebook' | 'Twitter' | 'Instagram' | 'LinkedIn'; // Platform for the campaign
  name: string; // Campaign name
  createdAt: string; // Date when the campaign was created
  startDate: string; // Start date of the campaign
  endDate: string; // End date of the campaign
  senderHandle: string; // Handle of the sender
  receiverHandle: string; // Handle of the receiver (could be user or group)
  hashtags: string[]; // List of hashtags
  actions: SocialAction[]; // List of actions performed in the campaign
}

// Specific types for Email Campaigns

// Enum-like type for campaign categories
export type CampaignType =
  | 'text'
  | 'call'
  | 'dm'
  | 'email'
  | 'total'
  | 'conversations'
  | 'social'
  | 'total';

// A Stat type that could be reused for each campaign type in various views
export type Stat = {
  title: string;
  value: number;
  statType: CampaignType; // StatType should match the campaign types
  click: boolean;
  past24hours?: number;
  rowSpan?: number; // Optional rowSpan value
  colSpan?: number; // Optional colSpan value
};

// Reusable type for campaign data
// Updated Campaign type to include primaryType and secondaryType
export type CampaignGlobalType =
  | GHLTextMessageCampaign
  | CallCampaign
  | SocialMediaCampaign
  | EmailCampaign;

// Optional runtime validation logic
