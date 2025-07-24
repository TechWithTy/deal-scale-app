import { APP_TESTING_MODE } from "@/constants/data";
import { campaignStatusesGB } from "@/types/_dashboard/campaign";
import type { GHLTextMessageCampaign } from "@/types/goHighLevel/text";
import { faker } from "@faker-js/faker";
import { generateSampleTextMessage } from "./texts";

// Generate a single sample TextMessageCampaign
const generateSampleTextMessageCampaign = (): GHLTextMessageCampaign => {
	const totalMessages = faker.number.int({ min: 50, max: 200 });
	const sentCount = faker.number.int({ min: 30, max: totalMessages });
	const deliveredCount = faker.number.int({ min: 0, max: sentCount });
	const failedCount = totalMessages - sentCount;

	return {
		id: faker.string.uuid(),
		startDate: faker.date.past().toISOString(),

		name: faker.company.name(),
		status: faker.helpers.arrayElement(campaignStatusesGB),
		createdAt: faker.date.past().toISOString(),
		sentCount: sentCount,
		deliveredCount: deliveredCount,
		failedCount: failedCount,
		totalMessages: totalMessages,
		lastMessageSentAt: faker.date.recent().toISOString(),
		conversationId: faker.string.uuid(),
		// Use the correct function to generate messages for the campaign
		messages: Array.from({ length: totalMessages }, () =>
			generateSampleTextMessage(),
		),
	};
};

// Generate an array of sample TextMessageCampaigns
export const generateSampleTextMessageCampaigns = (
	count = 100,
): GHLTextMessageCampaign[] => {
	return Array.from({ length: count }, generateSampleTextMessageCampaign);
};

export const mockTextCampaigns =
	APP_TESTING_MODE && generateSampleTextMessageCampaigns();
