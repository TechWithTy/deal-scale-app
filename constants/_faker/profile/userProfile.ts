import { AIKnowledgebase, UserProfile } from '@/types/userProfile';
import {
  mockBillingHistory,
  mockPaymentDetails
} from '@/constants/_faker/profile/userData';
import { faker } from '@faker-js/faker'; // Import Faker.js for random data generation
import { mockTextCampaigns } from '@/constants/_faker/texts/textCampaign';
import { mockGeneratedSampleEmailCampaigns } from '@/constants/_faker/emails/emailCampaign';
import { mockSocialMediaCampaigns } from '@/constants/_faker/social/socialCampaigns';
import { mockCallCampaignData } from '@/constants/_faker/calls/callCampaign';
import { mockEmailCampaignAnalytics } from '@/constants/_faker/analytics/email';
import { mockCallCampaignAnalytics } from '@/constants/_faker/analytics/call';
import { mockTextMessageCampaignAnalytics } from '@/constants/_faker/analytics/text';
import { EmailCampaignAnalytics } from '@/types/goHighLevel/email';
import { TextMessageCampaignAnalytics } from '@/types/goHighLevel/text';
import { CallCampaignAnalytics } from '@/types/vapiAi/api/calls/get';
import { mockLeadListData } from '@/constants/dashboard/leadList';
import { APP_TESTING_MODE, mockGeneratedLeads } from '@/constants/data';
import { mockKanbanState } from '../kanban';
import { mockTeamMembers } from './team/members';
import { mockTrackingData } from './team/tasks';
import { mockSubscriptions } from './userSubscription';

// Updated aIKnowledgebase object with Faker.js dynamic values

// Example object adhering to AIKnowledgebase interface with Faker.js data
const aIKnowledgebase: AIKnowledgebase = {
  emailTemplate: '../../staticFiles/email-inlined.html', // Static or faker.lorem.sentence()
  salesScript: '../../staticFiles/voiceCloneScript.txt', // Static or faker.lorem.sentence()
  assignedAssistantID: faker.helpers.arrayElement(['ai', 'female', 'male']), // Randomly chosen from the array
  assignedSquadID: faker.string.uuid(), // Random UUID for the assigned squad

  recordings: {
    customVoiceID: faker.string.uuid(),
    voiceClone: {
      audioFile: faker.system.filePath(), // Path to cloned voice audio file (generated dynamically)
      clonedVoiceID: faker.string.uuid() // Unique ID for the cloned voice
    },
    voicemailFile: faker.system.filePath() // Path to voicemail audio file (generated dynamically)
  },

  aiAvatar: {
    avatarKandidFile: faker.system.filePath(), // Path to Kandid avatar file (generated dynamically)
    avatarMotionFile: faker.system.filePath(), // Path to avatar motion file (generated dynamically)
    videoDetails: {
      title: faker.lorem.words(3), // Example video title
      description: faker.lorem.sentence(), // Example video description
      ctaText: 'Click here', // Call-to-action text (static value)
      ctaLink: faker.internet.url() // Example call-to-action URL link
    }
  },

  background: {
    // Correctly added 'background' at the root level
    backgroundVideoFile: faker.system.filePath(), // Path to background video file
    backgroundMusic: faker.music.songName(), // Random song name from Faker.js
    colorScheme: {
      primaryColor: '#FF5733', // Example hex color for primary color
      secondaryColor: '#33FF57', // Example hex color for secondary color
      accentColor: '#5733FF' // Optional accent color in hex format
    }
  }
};

export const connectedAccounts = {
  facebook: faker.datatype.boolean()
    ? {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
        expiresIn: faker.number.int({ min: 3600, max: 7200 }),
        tokenType: 'Bearer',
        scope: 'public_profile,email',
        platform: 'facebook',
        profileId: faker.string.uuid(),
        pageId: faker.helpers.maybe(() => faker.string.uuid()) // Optional Page ID
      }
    : undefined, // Not connected if false

  instagram: faker.datatype.boolean()
    ? {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
        expiresIn: faker.number.int({ min: 3600, max: 7200 }),
        tokenType: 'Bearer',
        scope: 'user_profile,user_media',
        platform: 'instagram',
        userId: faker.string.uuid(),
        username: faker.internet.userName()
      }
    : undefined, // Not connected if false

  linkedIn: faker.datatype.boolean()
    ? {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
        expiresIn: faker.number.int({ min: 3600, max: 7200 }),
        tokenType: 'Bearer',
        scope: 'r_liteprofile,r_emailaddress',
        platform: 'linkedin',
        userId: faker.string.uuid(),
        companyId: faker.helpers.maybe(() => faker.string.uuid()) // Optional company ID
      }
    : undefined, // Not connected if false

  twitter: faker.datatype.boolean()
    ? {
        accessToken: faker.string.alphanumeric(32),
        refreshToken: faker.string.alphanumeric(32),
        expiresIn: faker.number.int({ min: 3600, max: 7200 }),
        tokenType: 'Bearer',
        scope: 'tweet.read,users.read',
        platform: 'twitter',
        userId: faker.string.uuid(),
        handle: faker.internet.userName()
      }
    : undefined // Not connected if false
};
// Mocking a user profile with Faker.js
export const mockUserProfile: UserProfile = {
  UniqueIdentifier: faker.string.uuid(), // Generates a UUID, // Generate unique ID
  subscription: mockSubscriptions[1],
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  country: faker.location.country(),
  city: faker.location.city(),
  personalNum: '3325436201',
  connectedAccounts: connectedAccounts,
  leadPreferences: {
    preferredLocation: [faker.location.city(), faker.location.city()],
    industry: 'Real Estate', // Static or use faker.commerce.department()
    minLeadQuality: faker.number.int({ min: 60, max: 100 }),
    maxBudget: faker.number.int({ min: 1000, max: 10000 })
  },
  savedSearches: [
    {
      id: faker.string.uuid(),
      name: 'High-Quality Leads', // Static or faker.commerce.productName()
      searchCriteria: {
        quality: 'high',
        location: faker.location.city()
      },
      createdAt: faker.date.recent()
    }
  ],
  notificationPreferences: {
    emailNotifications: faker.datatype.boolean(),
    smsNotifications: faker.datatype.boolean(),
    notifyForNewLeads: faker.datatype.boolean(),
    notifyForCampaignUpdates: faker.datatype.boolean()
  },
  integrations: [
    {
      platform: 'Salesforce', // Static
      apiKey: faker.string.uuid(), // Random UUID
      status: faker.helpers.arrayElement(['connected', 'disconnected']) // Random status
    }
  ],

  companyInfo: {
    companyName: faker.company.name(),
    webhook: faker.internet.url(),
    socialMediaTags: faker.lorem
      .words(3)
      .split(' ')
      .map((word) => `#${word}`),
    companyLogo: faker.image.avatarGitHub(), // Static, can be a URL or file path
    GHLID: { locationId: faker.string.uuid() }, // Random location ID
    assets: {
      logo: faker.image.avatar(), // Generates a random logo image URL (300x300 size)
      favicon: faker.image.urlLoremFlickr(), // Generates a random favicon image URL (64x64 size)
      banner: faker.image.urlLoremFlickr(), // Generates a random banner image URL (1200x300 size)
      ghlAssets: Array.from({ length: 5 }, () => faker.image.urlLoremFlickr()) // Generates an array of 5 random image URLs
    },

    campaigns: {
      textCampaigns: mockTextCampaigns, // Assuming these arrays are populated elsewhere
      emailCampaigns: mockGeneratedSampleEmailCampaigns,
      socialCampaigns: mockSocialMediaCampaigns,
      callCampaigns: mockCallCampaignData
    },
    KanbanTasks: mockKanbanState,
    forwardingNumber: '3325436201',
    outreachEmail: faker.internet.email(),
    explainerVideo: faker.internet.url(),
    campaignAnalytics: [
      mockCallCampaignAnalytics,
      mockTextMessageCampaignAnalytics,
      mockEmailCampaignAnalytics
    ] as (
      | EmailCampaignAnalytics
      | CallCampaignAnalytics
      | TextMessageCampaignAnalytics
    )[],
    leads: mockGeneratedLeads,
    leadLists: mockLeadListData // Assuming lead lists are generated or static
  },

  aIKnowledgebase: aIKnowledgebase,

  billingHistory: [
    {
      invoice: faker.string.uuid(),
      amount: faker.finance.amount(),
      status: faker.helpers.arrayElement(['Paid', 'Unpaid']),
      date: faker.date.past()
    }
  ],
  paymentDetails: {
    cardLastFour: faker.finance.creditCardNumber().slice(-4), // Extracts the last 4 digits
    expiry: faker.date
      .future()
      .toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }), // Outputs in MM/YY format
    cardType: faker.finance.creditCardIssuer() // Card issuer (Visa, MasterCard, etc.)
  },

  twoFactorAuth: {
    isEnabled: faker.datatype.boolean(),
    methods: {
      sms: faker.datatype.boolean(),
      email: faker.datatype.boolean(),
      authenticatorApp: faker.datatype.boolean()
    },
    lastEnabledAt: faker.date.past()
  },

  teamMembers: mockTeamMembers,

  activityLog: [
    {
      action: faker.helpers.arrayElement(['created', 'updated', 'deleted']),
      timestamp: faker.date.recent(),
      performedBy: faker.person.firstName(),
      taskTracking: mockTrackingData,
      userAgent: faker.system.networkInterface() + faker.internet.userAgent()
    }
  ],

  securitySettings: {
    lastLoginTime: faker.date.recent(),
    password: faker.string.uuid(),
    passwordUpdatedAt: faker.date.past()
  }
};

export const MockUserProfile = APP_TESTING_MODE && mockUserProfile;
