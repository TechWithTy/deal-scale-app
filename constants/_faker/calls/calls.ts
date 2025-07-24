import { faker } from '@faker-js/faker';
import { GetCallResponse } from '@/types/vapiAi/api/calls/get';
import {
  AssistantModel,
  FirstMessageMode,
  BackgroundSound,
  ConversationMessage,
  Assistant,
  ModelProvider,
  KnowledgeBase,
  ModelTool,
  MessageRole,
  ToolMessageType,
  ServerDetails,
  ModelFunction,
  ConditionOperator,
  BotMessage,
  FunctionCallMessage,
  FunctionResultMessage,
  NestedToolCallMessage,
  SystemMessage,
  ToolCallResultMessage,
  UserMessage,
  ChunkPlan,
  FormatPlan,
  Voice,
  ToolMessagesArray,
  CallStatus
} from '../../../types/vapiAi/api/calls/create';
// import { number, string } from 'zod';
import { APP_TESTING_MODE } from '@/constants/data';
import { EndedReason } from '@/types/vapiAi/api/calls/_enums';
import { CallType } from '@prisma/client';

// Assuming tools have a basic structure with ids and names
export const generateTools = () => [
  { id: faker.string.uuid(), name: faker.lorem.word() }
];
const generateToolMessages = (): ToolMessagesArray => {
  return Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
    type: faker.helpers.arrayElement<ToolMessageType>([
      ToolMessageType.ToolMessageComplete,
      ToolMessageType.ToolMessageDelayed,
      ToolMessageType.ToolMessageFailed,
      ToolMessageType.ToolMessageStart
    ]),
    content: faker.lorem.sentence(),

    // Randomly assign role or leave it undefined
    role: faker.helpers.maybe(() =>
      faker.helpers.arrayElement<MessageRole>([
        MessageRole.Assistant,
        MessageRole.System
      ])
    ),

    // Optional field to end the call after the message
    endCallAfterSpokenEnabled: faker.datatype.boolean(),

    // Optional timing field for delayed messages
    timingMilliseconds: faker.helpers.maybe(() =>
      faker.number.int({ min: 1000, max: 10000 })
    ),

    // Optional conditions
    conditions: faker.helpers
      .maybe(() => [
        {
          value: faker.lorem.word(), // Random word for value
          operator: faker.helpers.arrayElement<ConditionOperator>([
            ConditionOperator.Eq,
            ConditionOperator.Neq,
            ConditionOperator.Lt,
            ConditionOperator.Gte
          ]),
          param: faker.lorem.word() // Random word for the parameter name
        }
      ])
      ?.map((condition) => ({ ...condition })) // Optional chaining to ensure safe access
  }));
};

// Stub for KnowledgeBase if it's needed
const generateKnowledgeBase = (): KnowledgeBase => ({
  provider: 'canonical', // Hardcoded provider as per the type definition
  topK: faker.number.int({ min: 1, max: 10 }),
  fileIds: Array.from({ length: 3 }, () => faker.string.uuid()) // Generates 3 random file IDs
});
const generateModelFunction = (): ModelFunction => ({
  name: faker.lorem.word(), // Random function name
  description: faker.lorem.sentence(), // Random function description
  parameters: {
    type: 'object',
    properties: {
      [faker.lorem.word()]: faker.helpers.arrayElement([
        faker.lorem.word(),
        faker.number.int(),
        faker.datatype.boolean()
      ]),
      [faker.lorem.word()]: faker.helpers.arrayElement([
        faker.lorem.word(),
        faker.number.int(),
        faker.datatype.boolean()
      ])
    },
    required: [faker.lorem.word(), faker.lorem.word()] // Random required parameters
  }
});

const generateServerDetails = (): ServerDetails => ({
  timeoutSeconds: faker.number.int({ min: 30, max: 300 }), // Random timeout between 30 and 300 seconds
  url: faker.internet.url(), // Random URL
  secret: faker.internet.password({ length: 32 }) // Generates a 32-character secret
});

const generateModelTool = (): ModelTool => ({
  async: faker.datatype.boolean(),
  messages: generateToolMessages(), // Tool-specific messages
  type: 'dtmf', // Fixed type 'dtmf'
  function: generateModelFunction(), // Generates function with name, description, and parameters
  server: generateServerDetails() // Generates correct server details
});

const generateFormatPlan = (): FormatPlan => ({
  enabled: faker.datatype.boolean(), // Whether formatting is enabled
  numberToDigitsCutoff: faker.number.int({ min: 100, max: 10000 }) // Random cutoff for converting numbers to digits
});

const generateChunkPlan = (): ChunkPlan => ({
  enabled: faker.datatype.boolean(), // Whether chunking is enabled
  minCharacters: faker.number.int({ min: 50, max: 200 }), // Random minimum characters per chunk
  punctuationBoundaries: faker.helpers.arrayElements(['.', '!', '?', ',']), // Random punctuation boundaries
  formatPlan: generateFormatPlan() // Generate a format plan
});

// Generate mock data for Transcriber
const generateTranscriber = (): Transcriber => ({
  provider: faker.helpers.arrayElement(['deepgram', 'google', 'aws']), // Use valid providers
  model: faker.lorem.word(), // Random model name
  language: faker.helpers.arrayElement(['en', 'bg']), // Random language code (ISO standard)
  smartFormat: faker.datatype.boolean(), // Random boolean for smart formatting
  keywords: Array.from({ length: 3 }, () => faker.lorem.word()), // Random list of keywords
  endpointing: faker.number.int({ min: 100, max: 1000 }) // Random endpointing value
});

// Generate mock data for AssistantModel
const generateAssistantModel = (): AssistantModel => ({
  messages: generateMessages(),
  tools: Array.from({ length: 2 }, generateModelTool), // Generates two tools
  toolIds: Array.from({ length: 3 }, () => faker.string.uuid()), // Generates random tool IDs
  provider: faker.helpers.arrayElement<ModelProvider>([
    'anyscale',
    'openai',
    'azure',
    'google',
    'custom'
  ]),
  model: faker.lorem.word(),
  temperature: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
  knowledgeBase: generateKnowledgeBase(),
  maxTokens: faker.number.int({ min: 100, max: 1000 }),
  emotionRecognitionEnabled: faker.datatype.boolean(),
  numFastTurns: faker.number.int({ min: 1, max: 10 })
});
// Generate mock data for FirstMessageMode
const generateFirstMessageMode = (): FirstMessageMode =>
  faker.helpers.arrayElement([
    'assistant-speaks-first',
    'assistant-waits-for-user'
  ]);

// Generate mock data for BackgroundSound
const generateBackgroundSound = (): BackgroundSound =>
  faker.helpers.arrayElement(['off', 'office']);

const generateMessages = (): ConversationMessage[] => {
  return Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => {
    // Randomly select a message type based on the structure of ConversationMessage
    const messageType = faker.helpers.arrayElement<ConversationMessage>([
      {} as UserMessage,
      {} as SystemMessage,
      {} as BotMessage,
      {} as FunctionCallMessage,
      {} as NestedToolCallMessage,
      {} as ToolCallResultMessage,
      {} as FunctionResultMessage
    ]);

    // Based on the messageType, return the appropriate structure
    if ('role' in messageType && messageType.role === 'user') {
      return {
        role: 'user',
        message: faker.lorem.sentence(),
        time: faker.date.past().getTime(),
        secondsFromStart: faker.number.int({ min: 0, max: 300 }),
        endTime: faker.date.recent().getTime(),
        duration: faker.helpers.maybe(() =>
          faker.number.int({ min: 1, max: 60 })
        )
      } as UserMessage;
    }

    if ('role' in messageType && messageType.role === 'system') {
      return {
        role: 'system',
        message: faker.lorem.sentence(),
        time: faker.date.past().getTime(),
        secondsFromStart: faker.number.int({ min: 0, max: 300 })
      } as SystemMessage;
    }

    if ('role' in messageType && messageType.role === 'bot') {
      return {
        role: 'bot',
        message: faker.lorem.sentence(),
        time: faker.date.past().getTime(),
        secondsFromStart: faker.number.int({ min: 0, max: 300 }),
        endTime: faker.date.recent().getTime()
      } as BotMessage;
    }

    if ('role' in messageType && messageType.role === 'function-call') {
      return {
        role: 'function-call',
        message: faker.lorem.sentence(),
        time: faker.date.past().getTime(),
        secondsFromStart: faker.number.int({ min: 0, max: 300 }),
        name: faker.lorem.word(),
        args: JSON.stringify({
          arg1: faker.lorem.word(),
          arg2: faker.number.int()
        })
      } as FunctionCallMessage;
    }

    if ('role' in messageType && messageType.role === 'tool-call') {
      return {
        role: 'tool-call',
        message: faker.lorem.sentence(),
        time: faker.date.past().getTime(),
        secondsFromStart: faker.number.int({ min: 0, max: 300 }),
        toolCalls: Array.from(
          { length: faker.number.int({ min: 1, max: 3 }) },
          () => ({
            callId: faker.string.uuid(),
            name: faker.lorem.word(),
            result: JSON.stringify({ result: faker.lorem.sentence() })
          })
        )
      } as NestedToolCallMessage;
    }

    if ('role' in messageType && messageType.role === 'tool-call-result') {
      return {
        role: 'tool-call-result',
        message: faker.lorem.sentence(),
        time: faker.date.past().getTime(),
        secondsFromStart: faker.number.int({ min: 0, max: 300 }),
        toolCallId: faker.string.uuid(),
        name: faker.lorem.word(),
        result: JSON.stringify({ result: faker.lorem.sentence() })
      } as ToolCallResultMessage;
    }

    if ('role' in messageType && messageType.role === 'function-result') {
      return {
        role: 'function-result',
        message: faker.lorem.sentence(),
        time: faker.date.past().getTime(),
        secondsFromStart: faker.number.int({ min: 0, max: 300 }),
        name: faker.lorem.word(),
        result: JSON.stringify({ result: faker.lorem.sentence() })
      } as FunctionResultMessage;
    }

    // Fallback to system message if no match
    return {
      role: 'system',
      message: faker.lorem.sentence(),
      time: faker.date.past().getTime(),
      secondsFromStart: faker.number.int({ min: 0, max: 300 })
    } as SystemMessage;
  });
};
const generateVoice = (): Voice => ({
  fillerInjectionEnabled: faker.datatype.boolean(),
  provider: faker.helpers.arrayElement(['azure', 'google', 'anyscale']), // Corrected to use only 'azure', 'google', and 'anyscale'
  voiceId: faker.string.alphanumeric(10), // Corrected to use faker.string.alphanumeric
  speed: faker.number.float({ min: 0.5, max: 2.0, fractionDigits: 2 }),
  chunkPlan: generateChunkPlan()
});

// Generate fake Assistant data
const generateAssistant = (): Assistant => ({
  transcriber: generateTranscriber(),
  model: generateAssistantModel(),
  voice: generateVoice(),
  firstMessageMode: generateFirstMessageMode(),
  recordingEnabled: faker.datatype.boolean(),
  hipaaEnabled: faker.datatype.boolean(),
  clientMessages: Array.from({ length: 3 }, () => faker.lorem.sentence()),
  serverMessages: Array.from({ length: 3 }, () => faker.lorem.sentence()),
  silenceTimeoutSeconds: faker.number.int({ min: 5, max: 60 }),
  maxDurationSeconds: faker.number.int({ min: 60, max: 3600 }),
  backgroundSound: generateBackgroundSound(),
  backchannelingEnabled: faker.datatype.boolean(),
  backgroundDenoisingEnabled: faker.datatype.boolean()
});

// Create 100 fake GetCallResponse data entries
export const generateCallData = (): GetCallResponse[] => {
  const callData: GetCallResponse[] = [];

  for (let i = 0; i < 100; i++) {
    const type: CallType = faker.helpers.arrayElement([
      'inboundPhoneCall',
      'outboundPhoneCall',
      'webCall'
    ]);

    const status: CallStatus = faker.helpers.arrayElement([
      'queued',
      'ringing',
      'in-progress',
      'forwarding',
      'ended'
    ]);

    const endedReason: EndedReason | undefined = faker.helpers.maybe(() =>
      faker.helpers.arrayElement([
        'assistant-error',
        'assistant-not-found',
        'customer-busy',
        'exceeded-max-duration',
        'manually-canceled'
      ])
    );

    const callResponse: GetCallResponse = {
      id: faker.string.uuid(),
      orgId: faker.string.uuid(),
      type,
      monitor: {
        listenUrl: 'https://example.com/listen',
        controlUrl: 'https://example.com/control'
      },
      phoneCallProvider: faker.helpers.arrayElement([
        'twilio',
        'vonage',
        'vapi'
      ]),
      phoneCallTransport: faker.helpers.arrayElement(['sip', 'pstn']),
      status,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.past().toISOString(),
      startedAt: faker.helpers.maybe(() => faker.date.past().toISOString()),
      endedAt: faker.helpers.maybe(() => faker.date.past().toISOString()),
      cost: faker.number.float({ min: 5, max: 25, fractionDigits: 2 }),
      costBreakdown: {
        transport: faker.number.float({ min: 0, max: 10, fractionDigits: 2 }),
        stt: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
        llm: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
        tts: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
        vapi: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
        total: faker.number.float({ min: 0, max: 25, fractionDigits: 2 }),
        llmPromptTokens: faker.number.int({ min: 100, max: 1000 }),
        llmCompletionTokens: faker.number.int({ min: 100, max: 1000 }),
        ttsCharacters: faker.number.int({ min: 1000, max: 5000 })
      },
      transcript: faker.lorem.paragraph(),
      recordingUrl: faker.helpers.maybe(() => faker.internet.url()),
      stereoRecordingUrl: faker.helpers.maybe(() => faker.internet.url()),
      artifact: faker.helpers.maybe(() => ({
        videoRecordingEnabled: faker.datatype.boolean(),
        recordingS3PathPrefix: faker.internet.url()
      })),
      analysis: faker.helpers.maybe(() => ({
        summary: faker.lorem.sentence(),
        structuredData: { someKey: faker.lorem.word() },
        successEvaluation: faker.lorem.sentence()
      })),
      assistantId: faker.helpers.maybe(() => faker.string.uuid()),
      assistant: generateAssistant(),
      messages: generateMessages(),
      endedReason
    };

    callData.push(callResponse);
  }

  return callData;
};

export const mockIndividualCallData = APP_TESTING_MODE && generateCallData();
