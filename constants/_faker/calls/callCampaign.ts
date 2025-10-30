import {
        Faker,
        base,
        en,
        faker as globalFaker,
        generateMersenne53Randomizer,
} from "@faker-js/faker";

import { endedReasonValues } from "@/types/vapiAi/api/calls/_enums";
import type { CallType } from "@/types/vapiAi/api/calls/_enums";
import type { CallStatus } from "@/types/vapiAi/api/calls/create";
import type { GetCallResponse } from "@/types/vapiAi/api/calls/get";
import {
	type CallCampaign,
	type CallInfo,
	type TransferType,
	campaignStatusesGB,
} from "../../../types/_dashboard/campaign";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "../../data";
import {
        CALL_CAMPAIGN_FAKER_SEED,
        generateCallCampaignData,
} from "./internal/callCampaignGenerator";

const CALL_CAMPAIGN_FAKER_SEED = 1337;

const getRandomizer = (randomizer?: Faker): Faker => randomizer ?? globalFaker;

// Helper function to generate a phone number in the +1-XXX-XXX-XXXX format
const generatePhoneNumber = (randomizer?: Faker): string => {
        const source = getRandomizer(randomizer);
        const areaCode = source.number.int({ min: 100, max: 999 });
        const prefix = source.number.int({ min: 100, max: 999 });
        const lineNumber = source.number.int({ min: 1000, max: 9999 });
        return `+1-${areaCode}-${prefix}-${lineNumber}`;
};

// Helper function to create fake call response
const generateGetCallResponse = (randomizer?: Faker): GetCallResponse => {
        const source = getRandomizer(randomizer);
        const callStatuses: CallStatus[] = [
                "queued",
                "ringing",
		"in-progress",
		"forwarding",
		"ended",
	];
	const callTypes: CallType[] = [
		"inboundPhoneCall",
		"outboundPhoneCall",
		"webCall",
	];

        return {
                id: source.string.uuid(),
                orgId: source.string.uuid(),
                type: source.helpers.arrayElement(callTypes),
                phoneCallProvider: source.helpers.arrayElement(["twilio", "vonage", "vapi"]),
                phoneCallTransport: source.helpers.arrayElement(["sip", "pstn"]),
                status: source.helpers.arrayElement(callStatuses),
                endedReason: source.helpers.maybe(
                        () => source.helpers.arrayElement(endedReasonValues),
                        {
                                probability: 0.3,
                        },
                ),
                messages: [], // Assuming no messages for simplicity
                createdAt: source.date.past().toISOString(),
                updatedAt: source.date.recent().toISOString(),
                startedAt: source.date.recent().toISOString(),
                endedAt: source.date.recent().toISOString(),
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
                assistant: undefined, // Assuming assistant info is not provided
                // Add the required monitor property
                monitor: {
                        listenUrl: source.internet.url(),
                        controlUrl: source.internet.url(),
                },
        };
};

// Helper function to create CallInfo object
const generateCallInfo = (campaignId: string, randomizer?: Faker): CallInfo => {
        const source = getRandomizer(randomizer);
        return {
                callResponse: generateGetCallResponse(source),
                contactId: source.string.uuid(), // Generate a unique contact ID
                campaignId: campaignId, // Use the same campaign ID for all calls within a campaign
        };
};

// Helper function to create CallCampaign data
const generateCallCampaign = (randomizer?: Faker): CallCampaign => {
        const source = getRandomizer(randomizer);
        const campaignId = source.string.uuid(); // Unique campaign ID for this campaign

        const callTypes: CallCampaign["callType"][] = ["inbound", "outbound"];

        // Decide whether this campaign uses an AI avatar agent; if not, create a human agent with a role
        const aiAvatarAgent = source.helpers.maybe(() => source.person.firstName(), {
                probability: 0.2,
        });
        const humanName = !aiAvatarAgent ? source.person.fullName() : undefined;
        const humanRole = !aiAvatarAgent
                ? source.number.int({ min: 1, max: 100 }) <= 70
                        ? "Closer"
                        : "Custom"
                : undefined;

        return {
                id: campaignId,
                name: `${source.company.name()}`,
                goal: source.lorem.sentence(),
                status: source.helpers.arrayElement(campaignStatusesGB),
                startDate: source.date.past().toISOString(),
                endDate: source.helpers.maybe(() => source.date.future().toISOString(), {
                        probability: 0.7,
                }),
                // Fixed: endedReason should be an array
                endedReason: [source.helpers.arrayElement(endedReasonValues)],

                aiVoice: source.helpers.maybe(() => source.person.firstName(), {
                        probability: 0.3,
                }),
                aiScript: source.lorem.paragraph(),
                // Friendly script name and status for table chips
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
                // Human agent fields (when no AI agent is present)
                agentName: humanName,
                agentTitle: humanName,
                agent: humanName,
                agentRole: humanRole,
                role: humanRole,
                humanRole: humanRole,
                callInformation: Array.from({ length: 10 }, () =>
                        generateCallInfo(campaignId, source),
                ), // Use CallInfo objects
                callerNumber: generatePhoneNumber(source),
                receiverNumber: generatePhoneNumber(source),
                duration: source.number.int({ min: 30, max: 600 }), // Call duration in seconds
                callType: source.helpers.arrayElement(callTypes),
                timestamp: source.date.recent(),
                calls: source.number.int({ min: 1, max: 100 }),
                inQueue: source.number.int({ min: 0, max: 10 }),
                leads: source.number.int({ min: 0, max: 10 }),
                voicemail: source.number.int({ min: 0, max: 10 }),
                hungUp: source.number.int({ min: 0, max: 10 }),
                dead: source.number.int({ min: 0, max: 5 }),
                wrongNumber: source.number.int({ min: 0, max: 5 }),
                inactiveNumbers: source.number.int({ min: 0, max: 5 }),
                // Per-source DNC breakdown for UI display
                ...(() => {
                        const total = source.number.int({ min: 0, max: 5 });
                        let remaining = total;
                        const pick = (max: number) => {
                                const v = source.number.int({
                                        min: 0,
                                        max: Math.max(0, max),
                                });
                                remaining -= v;
                                return v;
                        };
			const text = pick(remaining);
			const email = pick(remaining);
			const dm = pick(remaining);
			const manual = pick(remaining);
			// allocate remainder to call and scrub evenly-ish
			const call = Math.max(0, Math.floor(remaining / 2));
			const scrub = Math.max(0, remaining - call);
			return {
				// Keep dnc total in sync with breakdown total
				dnc: total,
				dncBreakdown: { text, email, call, dm, manual, scrub },
			};
		})(),
                scriptID: source.string.uuid(),
                funnelID: source.string.uuid(),
                workflowID: source.string.uuid(),
                // New dialing configuration & webhook mock data
                totalDialAttempts: source.number.int({ min: 1, max: 8 }),
                maxDailyAttempts: source.number.int({ min: 1, max: 4 }),
                minMinutesBetweenCalls: source.number.int({ min: 5, max: 240 }),
                countVoicemailAsAnswered: source.datatype.boolean(),
                postCallWebhookUrl: source.helpers.maybe(
                        () =>
                                `${source.internet.url({ appendSlash: false })}/webhooks/post-call`,
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
		// Build a breakdown of transfers by category for richer UI
		// and ensure the total transfers equals the sum of breakdown values
		...(() => {
			const cats: readonly TransferType[] = [
				"chat_agent",
				"voice_inbound",
				"voice_outbound",
				"text",
				"social_media",
				"appraisal",
				"live_person",
				"live_person_calendar",
                        ] as const;
                        const breakdown: Partial<Record<TransferType, number>> = {};
                        let total = 0;
                        for (const c of cats) {
                                const n = source.number.int({ min: 0, max: 8 });
                                if (n > 0) breakdown[c] = n;
                                total += n;
                        }
			return {
				transferBreakdown: breakdown,
				transfers: total,
			};
		})(),
	};
};

// Generate 100 entries of CallCampaign data
export const generateCallCampaignData = (randomizer?: Faker): CallCampaign[] => {
        const source = getRandomizer(randomizer);
        return Array.from({ length: 100 }, () => generateCallCampaign(source));
};

const deterministicFallbackCampaigns = (() => {
        const seeded = new Faker({
                locale: [en, base],
                randomizer: generateMersenne53Randomizer(),
        });
        seeded.seed(CALL_CAMPAIGN_FAKER_SEED);
        return generateCallCampaignData(seeded);
})();

export const fallbackCallCampaignData = deterministicFallbackCampaigns;

// Example of generating 100 entries
export const mockCallCampaignData: CallCampaign[] | false =
        NEXT_PUBLIC_APP_TESTING_MODE && deterministicFallbackCampaigns;
