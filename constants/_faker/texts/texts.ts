import type {
	SendblueListResponse,
	SendblueMessagePayload,
	TextMessage,
	TwilioMessagePayload,
} from "@/types/goHighLevel/text";
import { faker } from "@faker-js/faker";
import { NEXT_PUBLIC_APP_TESTING_MODE } from "../../data";

// Generate a single sample TextMessage
export const generateSampleTextMessage = (): TextMessage => {
	// Randomly pick a provider flavor for demo
	const provider = faker.helpers.arrayElement([
		"ghl",
		"sendblue",
		"twilio",
	] as const);

	const base: TextMessage = {
		id: faker.string.uuid(),
		type: faker.number.int({ min: 1, max: 3 }),
		messageType: faker.helpers.arrayElement(["TYPE_SMS", "TYPE_EMAIL"]),
		locationId: faker.string.uuid(),
		contactId: faker.string.uuid(),
		conversationId: faker.string.uuid(),
		dateAdded: faker.date.past().toISOString(),
		body: faker.lorem.sentence(),
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
		meta: { email: { messageIds: [faker.string.uuid()] } },
		source: faker.helpers.arrayElement([
			"workflow",
			"bulk_actions",
			"campaign",
			"api",
			"app",
		]),
		provider,
	};

	if (provider === "sendblue") {
		const isApple = faker.datatype.boolean();
		const sb: SendblueMessagePayload = {
			accountEmail: "user@example.com",
			content: base.body ?? "",
			date_sent: faker.date.recent().toISOString(),
			date_updated: faker.date.recent().toISOString(),
			error_code: null,
			error_detail: null,
			error_message: null,
			error_reason: null,
			from_number: faker.phone.number({ style: "international" }),
			group_display_name: null,
			group_id: null,
			is_outbound: base.direction === "outbound",
			media_url: base.attachments?.[0] ?? null,
			message_handle: `msg_${faker.string.alphanumeric(12)}`,
			message_type: "message",
			number: faker.phone.number({ style: "international" }),
			opted_out: false,
			participants: [faker.person.fullName()],
			plan: "premium",
			send_style: isApple ? "celebration" : null,
			sendblue_number: faker.phone.number({ style: "international" }),
			service: isApple ? "iMessage" : "SMS",
			status: faker.helpers.arrayElement(["SENT", "DELIVERED", "FAILED"]),
			to_number: faker.phone.number({ style: "international" }),
			was_downgraded: false,
		};
		base.sendbluePayload = sb;
		base.service = sb.service ?? undefined;
		base.appleDevice = sb.service === "iMessage";
	} else if (provider === "twilio") {
		const tw: TwilioMessagePayload = {
			sid: `SM${faker.string.alphanumeric(32)}`,
			accountSid: `AC${faker.string.alphanumeric(32)}`,
			to: faker.phone.number({ style: "international" }),
			from: faker.phone.number({ style: "international" }),
			body: base.body ?? "",
			status: faker.helpers.arrayElement([
				"queued",
				"sending",
				"sent",
				"delivered",
				"undelivered",
				"failed",
				"received",
			]),
			numMedia: String(faker.number.int({ min: 0, max: 3 })),
			dateCreated: faker.date.past().toISOString(),
			dateUpdated: faker.date.recent().toISOString(),
			dateSent: faker.date.recent().toISOString(),
		};
		base.twilioPayload = tw;
		base.service = "SMS";
		base.appleDevice = false;
	} else {
		// GHL native/default
		base.provider = "ghl";
		base.service = faker.datatype.boolean() ? "iMessage" : "SMS";
		base.appleDevice = base.service === "iMessage";
	}

	return base;
};

export const generateSampleTextMessages = (count = 100): TextMessage[] => {
	return Array.from({ length: count }, generateSampleTextMessage);
};

export const mockTexts: TextMessage[] | false =
	NEXT_PUBLIC_APP_TESTING_MODE && generateSampleTextMessages();

// Convenience: produce a Sendblue list-style response for demos
export function generateSendblueList(count = 1): SendblueListResponse {
	const data: SendblueMessagePayload[] = Array.from({ length: count }, () => {
		const tm = generateSampleTextMessage();
		// Ensure flagged as sendblue
		tm.provider = "sendblue";
		if (!tm.sendbluePayload) {
			tm.sendbluePayload = {
				accountEmail: "user@example.com",
				content: tm.body ?? "Hello, World!",
				date_sent: faker.date.recent().toISOString(),
				date_updated: faker.date.recent().toISOString(),
				error_code: null,
				error_detail: null,
				error_message: null,
				error_reason: null,
				from_number:
					tm.twilioPayload?.from ??
					faker.phone.number({ style: "international" }),
				group_display_name: null,
				group_id: null,
				is_outbound: tm.direction === "outbound",
				media_url: tm.attachments?.[0] ?? null,
				message_handle: `msg_${faker.string.alphanumeric(12)}`,
				message_type: "message",
				number:
					tm.twilioPayload?.to ??
					faker.phone.number({ style: "international" }),
				opted_out: false,
				participants: [faker.person.fullName()],
				plan: "premium",
				send_style: tm.appleDevice ? "celebration" : null,
				sendblue_number: faker.phone.number({ style: "international" }),
				service: tm.appleDevice ? "iMessage" : "SMS",
				status: "OK",
				to_number:
					tm.twilioPayload?.to ??
					faker.phone.number({ style: "international" }),
				was_downgraded: false,
			};
		}
		return tm.sendbluePayload;
	});
	return {
		data,
		pagination: {
			hasMore: true,
			limit: 50,
			offset: 0,
			total: Math.max(100, count),
		},
		status: "OK",
	};
}
