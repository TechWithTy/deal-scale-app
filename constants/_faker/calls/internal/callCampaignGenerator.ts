import type { Faker } from "@faker-js/faker";

import {
        type CallCampaign,
        type CallInfo,
        type TransferType,
        campaignStatusesGB,
} from "../../../../types/_dashboard/campaign";
import { endedReasonValues } from "@/types/vapiAi/api/calls/_enums";

import {
        MILLISECONDS_IN_DAY,
        addMilliseconds,
        createDeterministicDateHelpers,
} from "./deterministicDates";
import { generateGetCallResponse } from "./callResponseGenerator";
import { generatePhoneNumber, getRandomizer } from "./shared";

export const CALL_CAMPAIGN_FAKER_SEED = 1337;

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
        const campaignId = source.string.uuid();
        const dates = createDeterministicDateHelpers(source);

        const callTypes: CallCampaign["callType"][] = ["inbound", "outbound"];

        const aiAvatarAgent = source.helpers.maybe(() => source.person.firstName(), {
                probability: 0.2,
        });
        const humanName = !aiAvatarAgent ? source.person.fullName() : undefined;
        const humanRole = !aiAvatarAgent
                ? source.number.int({ min: 1, max: 100 }) <= 70
                        ? "Closer"
                        : "Custom"
                : undefined;

        const startDate = dates.past({ maxDays: 240 });
        const endDateCandidate = addMilliseconds(
                startDate,
                source.number.int({ min: 7, max: 180 }) * MILLISECONDS_IN_DAY,
        );

        return {
                id: campaignId,
                name: `${source.company.name()}`,
                goal: source.lorem.sentence(),
                status: source.helpers.arrayElement(campaignStatusesGB),
                startDate: dates.iso(startDate),
                endDate: source.helpers.maybe(
                        () => dates.iso(endDateCandidate),
                        {
                                probability: 0.7,
                        },
                ),
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
                humanRole: humanRole,
                callInformation: Array.from({ length: 10 }, () =>
                        generateCallInfo(campaignId, source),
                ),
                callerNumber: generatePhoneNumber(source),
                receiverNumber: generatePhoneNumber(source),
                duration: source.number.int({ min: 30, max: 600 }),
                callType: source.helpers.arrayElement(callTypes),
                timestamp: dates.recent({ maxDays: 7 }),
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
                                const count = source.number.int({ min: 0, max: 8 });
                                if (count > 0) breakdown[category] = count;
                                total += count;
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
