import { APP_TESTING_MODE } from "@/constants/data";
import { campaignStatusesGB } from "@/types/_dashboard/campaign";
import type { EmailCampaign } from "@/types/goHighLevel/email";
import { faker } from "@faker-js/faker";
import { generateSampleEmails, sampleEmail } from "./email";

// Sample EmailCampaign generator
// Sample EmailCampaign generator
export const generateSampleEmailCampaign = (): EmailCampaign => {
	const totalRecipients = faker.number.int({ min: 50, max: 500 });
	const sent = faker.number.int({ min: 30, max: totalRecipients });
	const delivered = faker.number.int({ min: 0, max: sent });
	const opened = faker.number.int({ min: 0, max: delivered });
	const failed = faker.number.int({ min: 0, max: totalRecipients - sent });
	const bounced = faker.number.int({ min: 0, max: failed });

	return {
		id: faker.string.uuid(),
		name: faker.company.name(),
		startDate: faker.date.past().toISOString(),
		status: faker.helpers.arrayElement(campaignStatusesGB),
		emails: generateSampleEmails(faker.number.int({ min: 5, max: 20 })), // Attach the sample emails
		recipientCount: totalRecipients,
		sentCount: sent,
		deliveredCount: delivered,
		openedCount: opened,
		bouncedCount: bounced,
		failedCount: failed,
		scriptID: faker.string.uuid(),
		funnelID: faker.string.uuid(),
		workflowID: faker.string.uuid(),
		senderEmail: faker.internet.email(), // Add senderEmail here
	};
};

// Generate an array of sample email campaigns
const generateSampleEmailCampaigns = (count = 100): EmailCampaign[] => {
	return Array.from({ length: count }, generateSampleEmailCampaign);
};

export const mockGeneratedSampleEmailCampaigns =
	APP_TESTING_MODE && generateSampleEmailCampaigns();

export const sampleEmailCampaign: EmailCampaign = {
	id: "campaign-001",
	name: "Welcome Campaign",
	startDate: "2024-09-01T12:00:00Z",
	status: "delivered",
	emails: [
		sampleEmail,
		{
			...sampleEmail,
			id: "email-124",
			subject: "Follow-up Email",
			body: "Here is a follow-up email to check in with you.",
		},
	], // Attaching the same email for simplicity; you can create more variations if needed
	senderEmail: "marketing@example.com",
	recipientCount: 200,
	sentCount: 180,
	deliveredCount: 170,
	openedCount: 150,
	bouncedCount: 5,
	failedCount: 5,
	workflowID: "workflow-001",
	funnelID: "funnel-001",
	scriptID: "script-001",
};

export const sampleEmailCampaigns = [
	sampleEmailCampaign,
	sampleEmailCampaign,
	sampleEmailCampaign,
];
