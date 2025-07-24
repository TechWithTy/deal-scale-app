import { APP_TESTING_MODE } from "@/constants/data";
import type {
	EmailCampaignAnalytics,
	GetEmailByIdResponse,
} from "@/types/goHighLevel/email";
import { faker } from "@faker-js/faker";

// Function to generate mock emails for the email campaign
const generateMockEmails = (): GetEmailByIdResponse[] => {
	return Array.from({ length: faker.number.int({ min: 5, max: 20 }) }, () => ({
		id: faker.string.uuid(), // Unique email ID
		threadId: faker.string.uuid(), // Unique thread ID
		locationId: faker.string.uuid(), // Location ID
		contactId: faker.string.uuid(), // Contact ID
		conversationId: faker.string.uuid(), // Conversation ID
		dateAdded: faker.date.past().toISOString(), // ISO timestamp for when the email was added
		subject: faker.lorem.words(5), // Email subject
		body: faker.lorem.paragraphs(2), // Email body content
		direction: faker.helpers.arrayElement(["inbound", "outbound"]), // Inbound or outbound
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
		]), // Random status of the email
		contentType: "text/plain", // Content type
		attachments: faker.helpers.arrayElements(
			[faker.internet.url()],
			faker.number.int({ min: 0, max: 3 }),
		),
		provider: faker.helpers.arrayElement([
			"Leadconnector",
			"Gmail",
			"mailgun",
			"smtp",
			"custom",
		]), // Random provider
		from: faker.internet.email(), // Sender's email address
		to: [faker.internet.email()], // Recipient email address
		cc: faker.helpers.arrayElements(
			[faker.internet.email()],
			faker.number.int({ min: 0, max: 2 }),
		),
		bcc: faker.helpers.arrayElements(
			[faker.internet.email()],
			faker.number.int({ min: 0, max: 2 }),
		),
		replyToMessageId: faker.string.uuid(), // Reply-to message ID
		source: faker.helpers.arrayElement([
			"workflow",
			"bulk_action",
			"campaign",
			"api",
			"app",
		]), // Random email source
	}));
};

// Function to generate mock EmailCampaignAnalytics
const generateMockEmailCampaignAnalytics = (): EmailCampaignAnalytics => {
	const emails = generateMockEmails(); // Generate mock emails for the campaign

	return {
		id: faker.string.uuid(),
		name: faker.lorem.words(3), // Campaign name
		senderEmail: faker.internet.email(), // Sender's email address
		recipientCount: faker.number.int({ min: 100, max: 1000 }), // Total number of recipients
		sentCount: faker.number.int({ min: 50, max: 1000 }), // Number of emails sent
		deliveredCount: faker.number.int({ min: 40, max: 900 }), // Number of delivered emails
		openedCount: faker.number.int({ min: 10, max: 800 }), // Number of emails opened by recipients
		bouncedCount: faker.number.int({ min: 0, max: 50 }), // Number of bounced emails
		failedCount: faker.number.int({ min: 0, max: 10 }), // Number of failed emails
		emails, // The array of emails associated with the campaign
		workflowID: faker.helpers.maybe(() => faker.string.uuid()), // Optional workflow ID
		funnelID: faker.helpers.maybe(() => faker.string.uuid()), // Optional funnel ID
		scriptID: faker.helpers.maybe(() => faker.string.uuid()), // Optional script ID
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
		startDate: faker.date.past().toISOString(), // Start date of the campaign
		endDate: faker.helpers.maybe(() => faker.date.recent().toISOString()), // Optional end date
		updatedAt: faker.date.recent().toISOString(), // Last updated time
	};
};

// Example usage:
export const mockEmailCampaignAnalytics =
	APP_TESTING_MODE && generateMockEmailCampaignAnalytics();
