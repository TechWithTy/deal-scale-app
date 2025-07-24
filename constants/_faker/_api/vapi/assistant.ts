import { faker } from "@faker-js/faker";
import { APP_TESTING_MODE } from "../../../data";
import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";

// Function to generate mock AssistantVoice data
export function generateMockAssistantVoice(): AssistantVoice {
	const providers = ["azure", "aws", "google", "11labs"] as const;

	return {
		id: faker.string.uuid(), // Added id
		name: `${faker.person.firstName()} ${faker.person.lastName()}`.trim(), // Replaced string concatenation with template literal and added trim()
		fillerInjectionEnabled: faker.datatype.boolean(),
		provider: faker.helpers.arrayElement(providers), // Randomly selects one provider
		voiceId: faker.string.uuid(), // Correct method for generating UUID in latest Faker.js
		speed: faker.number.float({ min: 0.8, max: 2, fractionDigits: 1 }), // Correct method using fractionDigits
		chunkPlan: {
			enabled: faker.datatype.boolean(),
			minCharacters: faker.number.int({ min: 50, max: 150 }), // Correct method for generating integer number
			punctuationBoundaries: [".", "?", "!", ",", ";"], // Some punctuation boundaries
			formatPlan: {
				enabled: faker.datatype.boolean(),
				numberToDigitsCutoff: faker.number.int({ min: 5, max: 20 }), // Correct method for generating integer number
			},
		},
		audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
	};
}

// Generate an array of mock AssistantVoice data
function generateMockVoices(count: number): AssistantVoice[] {
	return Array.from({ length: count }, () => generateMockAssistantVoice());
}

// Example: Generate 10 mock voices
export const mockVoices = APP_TESTING_MODE && generateMockVoices(20);
