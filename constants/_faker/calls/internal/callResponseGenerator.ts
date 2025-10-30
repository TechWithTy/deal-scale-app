import type { Faker } from "@faker-js/faker";

import { endedReasonValues } from "@/types/vapiAi/api/calls/_enums";
import type { CallStatus } from "@/types/vapiAi/api/calls/create";
import type { GetCallResponse } from "@/types/vapiAi/api/calls/get";
import type { CallType } from "@/types/vapiAi/api/calls/_enums";

import { addMilliseconds, createDeterministicDateHelpers } from "./deterministicDates";
import { getRandomizer } from "./shared";

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

export const generateGetCallResponse = (
        randomizer?: Faker,
): GetCallResponse => {
        const source = getRandomizer(randomizer);
        const dates = createDeterministicDateHelpers(source);

        const createdAt = dates.past({ maxDays: 120 });
        const startedAt = dates.recent({ maxDays: 14 });
        const durationSeconds = source.number.int({ min: 30, max: 900 });
        const endedAtDate = addMilliseconds(startedAt, durationSeconds * 1000);
        const updatedAt = addMilliseconds(
                endedAtDate,
                source.number.int({ min: 5, max: 600 }) * 1000,
        );

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
                messages: [],
                createdAt: dates.iso(createdAt),
                updatedAt: dates.iso(updatedAt),
                startedAt: dates.iso(startedAt),
                endedAt: dates.iso(endedAtDate),
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
