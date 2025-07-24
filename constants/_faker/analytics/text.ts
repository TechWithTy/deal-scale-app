import { APP_TESTING_MODE } from "@/constants/data";
import type {
	MessageType,
	TextMessage,
	TextMessageCampaignAnalytics,
} from "@/types/goHighLevel/text";
import { faker } from "@faker-js/faker";

// Mock Data for TextMessageCampaignAnalytics
const generateMockTextMessageCampaignAnalytics =
	(): TextMessageCampaignAnalytics => {
		const messageType: MessageType = "TYPE_SMS"; // Since this is an SMS campaign

		// Generate mock messages for the campaign
		const messages: TextMessage[] = Array.from(
			{ length: faker.number.int({ min: 5, max: 20 }) },
			() => ({
				id: faker.string.uuid(),
				type: 1, // Assuming 1 represents SMS
				messageType,
				locationId: faker.string.uuid(),
				contactId: faker.string.uuid(),
				conversationId: faker.string.uuid(),
				dateAdded: faker.date.past().toISOString(), // ISO timestamp for when the message was added
				body: faker.lorem.sentence(), // Message content
				direction: faker.helpers.arrayElement(["inbound", "outbound"]), // Inbound or outbound direction
				status: faker.helpers.arrayElement([
					"pending",
					"scheduled",
					"sent",
					"delivered",
					"read",
					"undelivered",
					"connected",
					"failed",
					"opened",
				]), // Random status for the message
				contentType: "text/plain", // Content type for SMS
				attachments: faker.helpers.arrayElements(
					[faker.internet.url()],
					faker.number.int({ min: 0, max: 2 }),
				),
				source: faker.helpers.arrayElement([
					"workflow",
					"bulk_actions",
					"campaign",
					"api",
					"app",
				]),
			}),
		);

		return {
			id: faker.string.uuid(),
			name: faker.lorem.words(3),
			createdAt: faker.date.past().toISOString(),
			sentCount: faker.number.int({ min: 50, max: 500 }), // Number of SMS sent
			deliveredCount: faker.number.int({ min: 40, max: 490 }), // Number of SMS delivered
			failedCount: faker.number.int({ min: 0, max: 10 }), // Number of failed SMS
			totalMessages: messages.length, // Total number of messages in the campaign
			lastMessageSentAt: faker.date.recent().toISOString(), // Date of the last message sent
			conversationId: faker.string.uuid(), // Associated conversation ID
			messages,
			status: faker.helpers.arrayElement([
				"delivered",
				"delivering",
				"failed",
				"pending",
				"completed",
				"missed",
				"queued",
				"read",
				"unread",
			]), // Random campaign status
			startDate: faker.date.past().toISOString(), // Campaign start date
			endDate: faker.date.recent().toISOString(), // Campaign end date
			updatedAt: faker.date.recent().toISOString(), // Last updated time
		};
	};

// Example usage:
export const mockTextMessageCampaignAnalytics =
	APP_TESTING_MODE && generateMockTextMessageCampaignAnalytics();
