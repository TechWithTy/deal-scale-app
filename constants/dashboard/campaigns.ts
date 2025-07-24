import type { SocialAction } from "@/types/_dashboard/campaign";
import type { EmailCampaign } from "@/types/goHighLevel/email";

// Instagram-specific actions exampleSocialMediaActions: Added missing 'viewLink'
export const exampleSocialMediaActions: {
	instagram: SocialAction[];
	linkedin: SocialAction[];
	twitter: SocialAction[];
} = {
	instagram: [
		{
			type: "Comment",
			status: "pending",
			attempt: 1,
			successful: 0,
			failed: 0,
			viewLink: "https://instagram.com/view/comment/1", // Added
		},
		{
			type: "Like",
			status: "successful",
			attempt: 1,
			successful: 1,
			failed: 0,
			viewLink: "https://instagram.com/view/like/1", // Added
		},
		{
			type: "👁️ Story",
			status: "pending",
			attempt: 2,
			successful: 0,
			failed: 0,
			viewLink: "https://instagram.com/view/story/1", // Added
		},
		{
			type: "Follow",
			status: "failed",
			attempt: 1,
			successful: 0,
			failed: 1,
			viewLink: "https://instagram.com/view/follow/1", // Added
		},
	],
	linkedin: [
		{
			type: "📩 Connections",
			status: "successful",
			attempt: 5,
			successful: 5,
			failed: 0,
			replyMessage: "Thanks for connecting!",
			viewLink: "https://linkedin.com/message/123",
		},
		{
			type: "Comment",
			status: "pending",
			attempt: 2,
			successful: 0,
			failed: 0,
			viewLink: "https://linkedin.com/view/comment/2", // Added
		},
		{
			type: "Follow",
			status: "successful",
			attempt: 3,
			successful: 3,
			failed: 0,
			viewLink: "https://linkedin.com/view/follow/3", // Added
		},
		{
			type: "Like",
			status: "successful",
			attempt: 4,
			successful: 4,
			failed: 0,
			viewLink: "https://linkedin.com/view/like/4", // Added
		},
		{
			type: "📩 Groups",
			status: "failed",
			attempt: 2,
			successful: 0,
			failed: 2,
			viewLink: "https://linkedin.com/view/groups/2", // Add ed
		},
		{
			type: "Connect & Follow Up",
			status: "pending",
			attempt: 3,
			successful: 0,
			failed: 0,
			viewLink: "https://linkedin.com/view/connect_followup/3", // Added
		},
		{
			type: "Invite to Follow",
			status: "successful",
			attempt: 2,
			successful: 2,
			failed: 0,
			viewLink: "https://linkedin.com/view/invite_follow/2", // Added
		},
	],
	twitter: [
		{
			type: "📩 Followers",
			status: "successful",
			attempt: 3,
			successful: 3,
			failed: 0,
			replyMessage: "Thank you for following!",
			viewLink: "https://twitter.com/message/456",
		},
		{
			type: "Follow",
			status: "pending",
			attempt: 1,
			successful: 0,
			failed: 0,
			viewLink: "https://twitter.com/view/follow/1", // Added
		},
		{
			type: "Like",
			status: "successful",
			attempt: 2,
			successful: 2,
			failed: 0,
			viewLink: "https://twitter.com/view/like/2", // Added
		},
	],
};

export const exampleCampaignsData = {
	emails: [
		{
			id: "1",
			name: "Order Confirmation Email Campaign",
			senderEmail: "support@company.com",
			status: "completed",
			startDate: "2024-01-18",
			emails: [
				{
					id: "1",
					threadId: "thread-12345",
					locationId: "location-1",
					contactId: "contact-1",
					conversationId: "conversation-1",
					dateAdded: "2024-01-18T08:00:00Z",
					subject: "Order Confirmation",
					body: "Your order has been confirmed and will be shipped soon.",
					direction: "outbound",
					status: "sent",
					contentType: "text/plain",
					provider: "mailgun",
					from: "support@company.com",
					to: ["customer@example.com"],
					attachments: [],
				},
			],
			recipientCount: 1,
			sentCount: 1,
			deliveredCount: 1,
			openedCount: 0,
			bouncedCount: 0,
			failedCount: 0,
			workflowID: "workflow-123",
			funnelID: "funnel-abc",
			scriptID: "script-xyz",
		},
		{
			id: "2",
			name: "Newsletter Campaign",
			senderEmail: "newsletter@company.com",
			status: "in_progress",
			startDate: "2024-01-18",
			emails: [
				{
					id: "2",
					threadId: "thread-67890",
					locationId: "location-2",
					contactId: "contact-2",
					conversationId: "conversation-2",
					dateAdded: "2024-01-18T09:45:00Z",
					subject: "New Arrivals",
					body: "Check out our latest collection of products.",
					direction: "outbound",
					status: "queued",
					contentType: "text/plain",
					provider: "mailgun",
					from: "newsletter@company.com",
					to: ["subscriber@example.com"],
					attachments: [],
				},
			],
			recipientCount: 1,
			sentCount: 0,
			deliveredCount: 0,
			openedCount: 0,
			bouncedCount: 0,
			failedCount: 0,
			workflowID: "workflow-456",
			funnelID: "funnel-def",
			scriptID: "script-lmn",
		},
	] as EmailCampaign[],
};
