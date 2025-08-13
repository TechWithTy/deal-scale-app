import { faker } from "@faker-js/faker";
import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "../../../data";

export function generateMockAssistantVoice(): AssistantVoice {
	return {
		id: faker.string.uuid(),
		name: `${faker.person.firstName()} ${faker.person.lastName()}`.trim(),
		fillerInjectionEnabled: faker.datatype.boolean(),
		provider: faker.helpers.arrayElement(["azure", "aws", "google", "11labs"]),
		voiceId: faker.string.uuid(),
		speed: faker.number.float({ min: 0.8, max: 1.2 }),
		audioUrl: faker.internet.url(),
		chunkPlan: {
			enabled: faker.datatype.boolean(),
			minCharacters: faker.number.int({ min: 20, max: 100 }),
			punctuationBoundaries: faker.helpers.arrayElements(
				[".", "!", "?", ",", ";", ":"],
				faker.number.int({ min: 2, max: 6 }),
			),
			formatPlan: {
				enabled: faker.datatype.boolean(),
				numberToDigitsCutoff: faker.number.int({ min: 5, max: 100 }),
			},
		},
	};
}

export function generateMockAssistantVoices(count: number): AssistantVoice[] {
	return Array.from({ length: count }, () => generateMockAssistantVoice());
}

export const mockAssistantVoices: AssistantVoice[] | false =
	NEXT_PUBLIC_APP_TESTING_MODE && generateMockAssistantVoices(10);
