import { APP_TESTING_MODE } from "@/constants/data";
import type { GetEmailByIdResponse } from "@/types/goHighLevel/email";
import { faker } from "@faker-js/faker";

// Generate a sample email
const generateSampleEmail = (): GetEmailByIdResponse => {
	return {
		id: faker.string.uuid(), // Updated to faker.string.uuid()
		altId: faker.string.uuid(),
		threadId: faker.string.uuid(),
		locationId: faker.string.uuid(),
		contactId: faker.string.uuid(),
		conversationId: faker.string.uuid(),
		dateAdded: faker.date.past().toISOString(),
		subject: faker.lorem.sentence(),
		body: faker.lorem.paragraphs(2),
		direction: faker.helpers.arrayElement(["inbound", "outbound"]),
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
		]),
		contentType: "text/plain",
		attachments: faker.datatype.boolean() ? [faker.internet.url()] : [],
		provider: faker.helpers.arrayElement([
			"Leadconnector",
			"Gmail",
			"mailgun",
			"smtp",
			"custom",
		]),
		from: faker.internet.email(),
		to: Array.from({ length: 2 }, () => faker.internet.email()),
		cc: faker.datatype.boolean() ? [faker.internet.email()] : undefined,
		bcc: faker.datatype.boolean() ? [faker.internet.email()] : undefined,
		replyToMessageId: faker.datatype.boolean()
			? faker.string.uuid()
			: undefined,
		source: faker.helpers.arrayElement([
			"workflow",
			"bulk_action",
			"campaign",
			"api",
			"app",
		]),
	};
};

// Generate an array of sample emails APP_TESTING_MODE
export const generateSampleEmails = (count = 10): GetEmailByIdResponse[] => {
	return Array.from({ length: count }, generateSampleEmail);
};

export const mockGeneratedSampleEmails =
	APP_TESTING_MODE && generateSampleEmails();

export const sampleEmail: GetEmailByIdResponse = {
	id: "email-123",
	threadId: "thread-001",
	locationId: "location-abc",
	contactId: "contact-xyz",
	conversationId: "conversation-789",
	dateAdded: "2024-09-10T12:00:00Z", // Example ISO timestamp
	subject: "Welcome to our service!",
	body: "Thank you for signing up for our service. We hope you enjoy using it.",
	direction: "outbound",
	status: "delivered",
	contentType: "text/plain",
	attachments: [
		"https://example.com/attachment1.pdf",
		"https://example.com/attachment2.png",
	],
	provider: "Leadconnector",
	from: "support@example.com",
	to: ["user1@example.com", "user2@example.com"],
	cc: ["manager@example.com"],
	bcc: ["admin@example.com"],
	replyToMessageId: "message-456",
	source: "campaign",
};
