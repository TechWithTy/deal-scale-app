import {
  CallStatus,
  ConversationMessage,
  Assistant,
  TranscriberProvider,
  ModelProvider,
  FirstMessageMode
} from '@/types/vapiAi/api/calls/create';
import {
  CallCampaignAnalytics,
  CostBreakdown,
  ArtifactPlan,
  AnalysisPlan
} from '@/types/vapiAi/api/calls/get';
import { faker } from '@faker-js/faker';
import { APP_TESTING_MODE } from '../../data';
import { EndedReason } from '@/types/vapiAi/api/calls/_enums';
import { CallType } from '@prisma/client';

// Mock Data for CallCampaignAnalytics
const generateMockCallCampaignAnalytics = (): CallCampaignAnalytics => {
  const callType: CallType = faker.helpers.arrayElement<CallType>([
    'inboundPhoneCall',
    'outboundPhoneCall',
    'webCall'
  ]);

  const callStatus: CallStatus = faker.helpers.arrayElement<CallStatus>([
    'queued',
    'ringing',
    'in-progress',
    'forwarding',
    'ended'
  ]);

  const endedReason: EndedReason = faker.helpers.arrayElement<EndedReason>([
    'assistant-error',
    'assistant-not-found',
    'customer-busy',
    'exceeded-max-duration',
    'manually-canceled'
  ]);

  const costBreakdown: CostBreakdown = {
    transport: parseFloat(faker.finance.amount({ min: 1, max: 5 })),
    stt: parseFloat(faker.finance.amount({ min: 1, max: 5 })),
    llm: parseFloat(faker.finance.amount({ min: 1, max: 5 })),
    tts: parseFloat(faker.finance.amount({ min: 1, max: 5 })),
    vapi: parseFloat(faker.finance.amount({ min: 1, max: 5 })),
    total: parseFloat(faker.finance.amount({ min: 10, max: 50 })),
    llmPromptTokens: faker.number.int(100), // Updated from faker.number.int
    llmCompletionTokens: faker.number.int(200), // Updated from faker.number.int
    ttsCharacters: faker.number.int(500) // Updated from faker.number.int
  };

  const messages: ConversationMessage[] = [
    {
      role: 'user',
      message: faker.lorem.sentence(),
      time: Date.now(),
      secondsFromStart: faker.number.int(300),
      endTime: Date.now() + faker.number.int(300),
      duration: faker.number.int(60)
    }
  ];
  // Assistant Mock Data
  const assistant: Assistant = {
    transcriber: {
      provider: faker.helpers.arrayElement<TranscriberProvider>([
        'deepgram',
        'azure',
        'google',
        'aws'
      ]), // Transcriber provider selection
      model: 'default', // Placeholder model for now
      language: 'en', // Default language English
      smartFormat: faker.datatype.boolean(),
      keywords: [faker.lorem.word(), faker.lorem.word()],
      endpointing: faker.number.int({ min: 1, max: 10 })
    },
    model: {
      messages: [
        {
          role: 'bot',
          message: faker.lorem.sentence(),
          time: faker.number.int(),
          secondsFromStart: faker.number.int({ min: 1, max: 60 }),
          endTime: faker.number.int({ min: 1, max: 100 })
        }
      ],
      tools: [
        {
          async: faker.datatype.boolean(),
          messages: [], // Assuming ToolMessage structure
          type: 'dtmf',
          function: {
            name: faker.lorem.word(),
            description: faker.lorem.sentence(),
            parameters: {
              type: 'object',
              properties: {}, // Can be filled based on actual use case
              required: ['param1']
            }
          },
          server: {
            timeoutSeconds: faker.number.int({ min: 1, max: 10 }),
            url: faker.internet.url(),
            secret: faker.internet.password()
          }
        }
      ],
      toolIds: [faker.string.uuid()],
      provider: faker.helpers.arrayElement<ModelProvider>([
        'anyscale',
        'openai',
        'azure',
        'google',
        'custom'
      ]), // LLM provider selection
      model: faker.person.firstName(), // Placeholder model name
      temperature: faker.number.float({ min: 0.1, max: 1.0 }),
      maxTokens: faker.number.int({ min: 100, max: 1000 }),
      emotionRecognitionEnabled: faker.datatype.boolean(),
      numFastTurns: faker.number.int({ min: 1, max: 10 }),
      knowledgeBase: {
        provider: 'canonical', // Using 'canonical' as a placeholder provider
        topK: faker.number.int({ min: 1, max: 10 }),
        fileIds: [faker.string.uuid(), faker.string.uuid()]
      }
    },
    voice: {
      fillerInjectionEnabled: faker.datatype.boolean(), // Whether filler words are enabled
      provider: faker.helpers.arrayElement(['azure', 'google', 'anyscale']), // Random provider
      voiceId: faker.string.uuid(), // Use faker.string.uuid() for UUID generation
      speed: faker.number.float({ min: 0.5, max: 1.5 }), // Use faker.number.float() to generate random speed
      chunkPlan: {
        enabled: faker.datatype.boolean(),
        minCharacters: faker.number.int({ min: 50, max: 100 }), // Random min characters between 50 and 100
        punctuationBoundaries: ['.', ',', ';'], // Example punctuation boundaries
        formatPlan: {
          enabled: faker.datatype.boolean(),
          numberToDigitsCutoff: faker.number.int({ min: 1000, max: 10000 }) // Random cutoff between 1000 and 10000
        }
      }
    },
    firstMessageMode: faker.helpers.arrayElement<FirstMessageMode>([
      'assistant-speaks-first',
      'assistant-waits-for-user'
    ]), // Assign directly from FirstMessageMode union type, // Rand,
    recordingEnabled: faker.datatype.boolean(),
    hipaaEnabled: faker.datatype.boolean(),
    clientMessages: [faker.lorem.sentence()],
    serverMessages: [faker.lorem.sentence()],
    silenceTimeoutSeconds: faker.number.int({ min: 100, max: 300 }), // Timeout between 100 and 300 seconds
    maxDurationSeconds: faker.number.int({ min: 1800, max: 7200 }), // Call duration between 30 minutes and 2 hours
    backgroundSound: faker.helpers.arrayElement(['off', 'office']), // Background sound choice
    backchannelingEnabled: faker.datatype.boolean(),
    backgroundDenoisingEnabled: faker.datatype.boolean()
  };

  const artifact: ArtifactPlan = {
    videoRecordingEnabled: faker.datatype.boolean(),
    recordingS3PathPrefix: faker.internet.url()
  };

  const analysis: AnalysisPlan = {
    summary: faker.lorem.sentences(3),
    structuredData: {},
    successEvaluation: faker.lorem.word()
  };

  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    callType,
    status: faker.helpers.arrayElement([
      'delivered',
      'delivering',
      'failed',
      'pending',
      'completed',
      'missed',
      'queued',
      'read',
      'unread'
    ]),
    callStatus,
    endedReason,
    cost: costBreakdown.total, // No need for parseFloat since it's already a number
    costBreakdown,
    messages,
    transcript: faker.lorem.paragraphs(2),
    assistantId: assistant.model.assistantID,
    assistant,
    artifact,
    analysis,
    recordingUrl: faker.internet.url(),
    stereoRecordingUrl: faker.internet.url(),
    startDate: faker.date.past().toISOString(), // Use startDate from CampaignBase
    updatedAt: faker.date.recent().toISOString() // Use ISO date format for updatedAt
  };
};

// Example usage:
export const mockCallCampaignAnalytics =
  APP_TESTING_MODE && generateMockCallCampaignAnalytics();
