import {
        Faker,
        base,
        en,
        faker as globalFaker,
        generateMersenne53Randomizer,
} from "@faker-js/faker";

import { endedReasonValues } from "@/types/vapiAi/api/calls/_enums";
import type { CallType } from "@/types/vapiAi/api/calls/_enums";
import type { GetCallResponse } from "@/types/vapiAi/api/calls/get";
import type { CallStatus } from "@/types/vapiAi/api/calls/create";
import {
        type CallCampaign,
        type CallInfo,
        type TransferType,
        campaignStatusesGB,
} from "../../../../types/_dashboard/campaign";
import { createDeterministicDateFactory } from "./deterministicDates";

const CALL_STATUSES: CallStatus[] = [
        "queued",
        "ringing",
        "in-progress",
        "forwarding",
        "ended",
];

const CALL_TYPES: CallType[] = ["inboundPhoneCall", "outboundPhoneCall", "webCall"];

const getRandomizer = (randomizer?: Faker): Faker => randomizer ?? globalFaker;

export const CALL_CAMPAIGN_FAKER_SEED = 1337;

export const createSeededCallCampaignFaker = (): Faker => {
        const seeded = new Faker({
                locale: [en, base],
                randomizer: generateMersenne53Randomizer(),
        });
        seeded.seed(CALL_CAMPAIGN_FAKER_SEED);
        return seeded;
};

const generatePhoneNumber = (randomizer?: Faker): string => {
        const source = getRandomizer(randomizer);
        const areaCode = source.number.int({ min: 100, max: 999 });
        const prefix = source.number.int({ min: 100, max: 999 });
        const lineNumber = source.number.int({ min: 1000, max: 9999 });
        return `+1-${areaCode}-${prefix}-${lineNumber}`;
};

const generateGetCallResponse = (randomizer?: Faker): GetCallResponse => {
        const source = getRandomizer(randomizer);
        const timeline = createDeterministicDateFactory(source);
        const createdAt = timeline.pastDate({ minDays: 2, maxDays: 45 });
        const startedAt = timeline.offsetFrom(createdAt, {
                direction: "forward",
                minMinutes: 30,
                maxMinutes: 24 * 60,
        });
        const endedAt = timeline.offsetFrom(startedAt, {
                direction: "forward",
                minMinutes: 5,
                maxMinutes: 4 * 60,
        });
        const updatedAt = timeline.offsetFrom(endedAt, {
                direction: "forward",
                minMinutes: 1,
                maxMinutes: 2 * 60,
        });

        return {
                id: source.string.uuid(),
                orgId: source.string.uuid(),
                type: source.helpers.arrayElement(CALL_TYPES),
                phoneCallProvider: source.helpers.arrayElement(["twilio", "vonage", "vapi"]),
                phoneCallTransport: source.helpers.arrayElement(["sip", "pstn"]),
                status: source.helpers.arrayElement(CALL_STATUSES),
                endedReason: source.helpers.maybe(
                        () => source.helpers.arrayElement(endedReasonValues),
                        {
                                probability: 0.3,
                        },
                ),
                messages: [],
                createdAt: createdAt.toISOString(),
                updatedAt: updatedAt.toISOString(),
                startedAt: startedAt.toISOString(),
                endedAt: endedAt.toISOString(),
                cost: source.number.int({ min: 10, max: 100 }),
                costBreakdown: {
                        transport: source.number.int({ min: 1, max: 10 }),
                        stt: source.number.int({ min: 1, max: 10 }),
                        llm: source.number.int({ min: 1, max: 10 }),
                        tts: source.number.int({ min: 1, max: 10 }),
                        vapi: source.number.int({ min: 1, max: 10 }),
                        total: source.number.int({ min: 50, max: 200 }),
                        llmPromptTokens: source.number.int({ min: 100, max: 1000 }),
                        llmCompletionTokens: source.number.int({ min: 100, max: 1000 }),
                        ttsCharacters: source.number.int({ min: 100, max: 1000 }),
                },
                transcript: source.lorem.sentence(),
                recordingUrl: source.internet.url(),
                stereoRecordingUrl: source.internet.url(),
                artifact: {
                        videoRecordingEnabled: source.datatype.boolean(),
                        recordingS3PathPrefix: source.system.filePath(),
                },
                analysis: {
                        summary: source.lorem.sentence(),
                        structuredData: {},
                        successEvaluation: source.lorem.sentence(),
                },
                assistantId: source.string.uuid(),
                assistant: undefined,
                monitor: {
                        listenUrl: source.internet.url(),
                        controlUrl: source.internet.url(),
                },
        };
};

const generateCallInfo = (campaignId: string, randomizer?: Faker): CallInfo => {
        const source = getRandomizer(randomizer);
        return {
                callResponse: generateGetCallResponse(source),
                contactId: source.string.uuid(),
                campaignId,
        };
};

const generateCallCampaign = (randomizer?: Faker): CallCampaign => {
        const source = getRandomizer(randomizer);
        const timeline = createDeterministicDateFactory(source);
        const campaignId = source.string.uuid();
        const startDate = timeline.pastDate({ minDays: 10, maxDays: 180 });
        const optionalEndDate = source.helpers.maybe(
                () => timeline.futureDate({ minDays: 14, maxDays: 240 }),
                { probability: 0.7 },
        );
        const timestamp = timeline.offsetFrom(startDate, {
                direction: "forward",
                minMinutes: 60,
                maxMinutes: 60 * 24 * 14,
        });

        const aiAvatarAgent = source.helpers.maybe(() => source.person.firstName(), {
                probability: 0.2,
        });
        const humanName = !aiAvatarAgent ? source.person.fullName() : undefined;
        const humanRole = !aiAvatarAgent
                ? source.number.int({ min: 1, max: 100 }) <= 70
                        ? "Closer"
                        : "Custom"
                : undefined;

        const callInformation = Array.from({ length: 10 }, () =>
                generateCallInfo(campaignId, source),
        );

        const callTypes: CallCampaign["callType"][] = ["inbound", "outbound"];

        return {
                id: campaignId,
                name: `${source.company.name()}`,
                goal: source.lorem.sentence(),
                status: source.helpers.arrayElement(campaignStatusesGB),
                startDate: startDate.toISOString(),
                endDate: optionalEndDate?.toISOString(),
                endedReason: [source.helpers.arrayElement(endedReasonValues)],
                aiVoice: source.helpers.maybe(() => source.person.firstName(), {
                        probability: 0.3,
                }),
                aiScript: source.lorem.paragraph(),
                scriptTitle: source.helpers.arrayElement([
                        "Property Pitch V2",
                        "Foreclosure Outreach",
                        "Expired Listings Intro",
                        "Absentee Owner Touch",
                        "General Seller Lead",
                ]),
                scriptName: undefined,
                script: undefined,
                scriptStatus: source.helpers.weightedArrayElement([
                        { weight: 5, value: "active" },
                        { weight: 3, value: "draft" },
                        { weight: 2, value: "archived" },
                ]),
                aiAvatarAgent,
                agentName: humanName,
                agentTitle: humanName,
                agent: humanName,
                agentRole: humanRole,
                role: humanRole,
                humanRole,
                callInformation,
                callerNumber: generatePhoneNumber(source),
                receiverNumber: generatePhoneNumber(source),
                duration: source.number.int({ min: 30, max: 600 }),
                callType: source.helpers.arrayElement(callTypes),
                timestamp,
                calls: source.number.int({ min: 1, max: 100 }),
                inQueue: source.number.int({ min: 0, max: 10 }),
                leads: source.number.int({ min: 0, max: 10 }),
                voicemail: source.number.int({ min: 0, max: 10 }),
                hungUp: source.number.int({ min: 0, max: 10 }),
                dead: source.number.int({ min: 0, max: 5 }),
                wrongNumber: source.number.int({ min: 0, max: 5 }),
                inactiveNumbers: source.number.int({ min: 0, max: 5 }),
                ...(() => {
                        const total = source.number.int({ min: 0, max: 5 });
                        let remaining = total;
                        const pick = (max: number) => {
                                const value = source.number.int({
                                        min: 0,
                                        max: Math.max(0, max),
                                });
                                remaining -= value;
                                return value;
                        };
                        const text = pick(remaining);
                        const email = pick(remaining);
                        const dm = pick(remaining);
                        const manual = pick(remaining);
                        const call = Math.max(0, Math.floor(remaining / 2));
                        const scrub = Math.max(0, remaining - call);
                        return {
                                dnc: total,
                                dncBreakdown: { text, email, call, dm, manual, scrub },
                        };
                })(),
                scriptID: source.string.uuid(),
                funnelID: source.string.uuid(),
                workflowID: source.string.uuid(),
                totalDialAttempts: source.number.int({ min: 1, max: 8 }),
                maxDailyAttempts: source.number.int({ min: 1, max: 4 }),
                minMinutesBetweenCalls: source.number.int({ min: 5, max: 240 }),
                countVoicemailAsAnswered: source.datatype.boolean(),
                postCallWebhookUrl: source.helpers.maybe(
                        () => `${source.internet.url({ appendSlash: false })}/webhooks/post-call`,
                        { probability: 0.7 },
                ),
                transfer: source.helpers.maybe(
                        () => ({
                                type: source.helpers.arrayElement([
                                        "chat_agent",
                                        "voice_inbound",
                                        "voice_outbound",
                                        "text",
                                        "social_media",
                                        "appraisal",
                                        "live_person",
                                        "live_person_calendar",
                                ] as const),
                                agentId: `agent_${source.number.int({ min: 100, max: 999 })}`,
                        }),
                        { probability: 0.8 },
                ),
                ...(() => {
                        const categories: readonly TransferType[] = [
                                "chat_agent",
                                "voice_inbound",
                                "voice_outbound",
                                "text",
                                "social_media",
                                "appraisal",
                                "live_person",
                                "live_person_calendar",
                        ];
                        const breakdown: Partial<Record<TransferType, number>> = {};
                        let total = 0;
                        for (const category of categories) {
                                const quantity = source.number.int({ min: 0, max: 8 });
                                if (quantity > 0) {
                                        breakdown[category] = quantity;
                                }
                                total += quantity;
                        }
                        return {
                                transferBreakdown: breakdown,
                                transfers: total,
                        };
                })(),
        };
};

export const generateCallCampaignData = (randomizer?: Faker): CallCampaign[] => {
        const source = getRandomizer(randomizer);
        return Array.from({ length: 100 }, () => generateCallCampaign(source));
};
