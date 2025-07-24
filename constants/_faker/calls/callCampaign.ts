import { faker } from '@faker-js/faker';

import {
  CallCampaign,
  CallInfo,
  campaignStatusesGB
} from '../../../types/_dashboard/campaign';
import { APP_TESTING_MODE } from '../../data';
import { CallStatus } from '@/types/vapiAi/api/calls/create';
import { GetCallResponse } from '@/types/vapiAi/api/calls/get';
import { CallType } from '@prisma/client';
import { endedReasonValues } from '@/types/vapiAi/api/calls/_enums';

// Helper function to generate a phone number in the +1-XXX-XXX-XXXX format
const generatePhoneNumber = (): string => {
  const areaCode = faker.number.int({ min: 100, max: 999 });
  const prefix = faker.number.int({ min: 100, max: 999 });
  const lineNumber = faker.number.int({ min: 1000, max: 9999 });
  return `+1-${areaCode}-${prefix}-${lineNumber}`;
};

// Helper function to create fake call response
const generateGetCallResponse = (): GetCallResponse => {
  const callStatuses: CallStatus[] = [
    'queued',
    'ringing',
    'in-progress',
    'forwarding',
    'ended'
  ];
  const callTypes: CallType[] = [
    'inboundPhoneCall',
    'outboundPhoneCall',
    'webCall'
  ];

  return {
    id: faker.string.uuid(),
    orgId: faker.string.uuid(),
    type: faker.helpers.arrayElement(callTypes),
    phoneCallProvider: faker.helpers.arrayElement(['twilio', 'vonage', 'vapi']),
    phoneCallTransport: faker.helpers.arrayElement(['sip', 'pstn']),
    status: faker.helpers.arrayElement(callStatuses),
    endedReason: faker.helpers.maybe(
      () => faker.helpers.arrayElement(endedReasonValues),
      {
        probability: 0.3
      }
    ),
    messages: [], // Assuming no messages for simplicity
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    startedAt: faker.date.recent().toISOString(),
    endedAt: faker.date.recent().toISOString(),
    cost: faker.number.int({ min: 10, max: 100 }),
    costBreakdown: {
      transport: faker.number.int({ min: 1, max: 10 }),
      stt: faker.number.int({ min: 1, max: 10 }),
      llm: faker.number.int({ min: 1, max: 10 }),
      tts: faker.number.int({ min: 1, max: 10 }),
      vapi: faker.number.int({ min: 1, max: 10 }),
      total: faker.number.int({ min: 50, max: 200 }),
      llmPromptTokens: faker.number.int({ min: 100, max: 1000 }),
      llmCompletionTokens: faker.number.int({ min: 100, max: 1000 }),
      ttsCharacters: faker.number.int({ min: 100, max: 1000 })
    },
    transcript: faker.lorem.sentence(),
    recordingUrl: faker.internet.url(),
    stereoRecordingUrl: faker.internet.url(),
    artifact: {
      videoRecordingEnabled: faker.datatype.boolean(),
      recordingS3PathPrefix: faker.system.filePath()
    },
    analysis: {
      summary: faker.lorem.sentence(),
      structuredData: {},
      successEvaluation: faker.lorem.sentence()
    },
    assistantId: faker.string.uuid(),
    assistant: undefined, // Assuming assistant info is not provided
    // Add the required monitor property
    monitor: {
      listenUrl: faker.internet.url(),
      controlUrl: faker.internet.url()
    }
  };
};

// Helper function to create CallInfo object
const generateCallInfo = (campaignId: string): CallInfo => {
  return {
    callResponse: generateGetCallResponse(),
    contactId: faker.string.uuid(), // Generate a unique contact ID
    campaignId: campaignId // Use the same campaign ID for all calls within a campaign
  };
};

// Helper function to create CallCampaign data
const generateCallCampaign = (): CallCampaign => {
  const campaignId = faker.string.uuid(); // Unique campaign ID for this campaign

  const callTypes: CallCampaign['callType'][] = ['inbound', 'outbound'];

  return {
    id: campaignId,
    name: `${faker.company.name()}`,
    goal: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(campaignStatusesGB),
    startDate: faker.date.past().toISOString(),
    endDate: faker.helpers.maybe(() => faker.date.future().toISOString(), {
      probability: 0.7
    }),
    aiVoice: faker.helpers.maybe(() => faker.person.firstName(), {
      probability: 0.3
    }),
    aiScript: faker.lorem.paragraph(),
    aiAvatarAgent: faker.helpers.maybe(() => faker.person.firstName(), {
      probability: 0.2
    }),
    callInformation: Array.from({ length: 10 }, () =>
      generateCallInfo(campaignId)
    ), // Use CallInfo objects
    callerNumber: generatePhoneNumber(),
    receiverNumber: generatePhoneNumber(),
    duration: faker.number.int({ min: 30, max: 600 }), // Call duration in seconds
    callType: faker.helpers.arrayElement(callTypes),
    timestamp: faker.date.recent(),
    calls: faker.number.int({ min: 1, max: 100 }),
    inQueue: faker.number.int({ min: 0, max: 10 }),
    leads: faker.number.int({ min: 0, max: 10 }),
    voicemail: faker.number.int({ min: 0, max: 10 }),
    hungUp: faker.number.int({ min: 0, max: 10 }),
    dead: faker.number.int({ min: 0, max: 5 }),
    wrongNumber: faker.number.int({ min: 0, max: 5 }),
    inactiveNumbers: faker.number.int({ min: 0, max: 5 }),
    dnc: faker.number.int({ min: 0, max: 5 }),
    scriptID: faker.string.uuid(),
    funnelID: faker.string.uuid(),
    workflowID: faker.string.uuid()
  };
};

// Generate 100 entries of CallCampaign data
const generateCallCampaignData = (): CallCampaign[] => {
  return Array.from({ length: 100 }, generateCallCampaign);
};

// Example of generating 100 entries
export const mockCallCampaignData =
  APP_TESTING_MODE && generateCallCampaignData();
