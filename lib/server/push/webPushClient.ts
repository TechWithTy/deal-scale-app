import webPush from "web-push";
import type { PushNotificationPayload } from "./schema";
import type { StoredPushSubscription } from "./subscriptionStore";

const contactEmail = process.env.PWA_CONTACT_EMAIL ?? "support@dealscale.app";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

let configured = false;

function configureWebPush(): void {
	if (configured) return;
	if (!vapidPublicKey || !vapidPrivateKey) {
		throw new Error(
			"Missing VAPID configuration. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env variables.",
		);
	}
	webPush.setVapidDetails(
		`mailto:${contactEmail}`,
		vapidPublicKey,
		vapidPrivateKey,
	);
	configured = true;
}

function toPushSubscription(
	record: StoredPushSubscription,
): webPush.PushSubscription {
	return {
		endpoint: record.endpoint,
		keys: record.keys,
		expirationTime:
			record.expirationTime === undefined ? null : record.expirationTime,
	};
}

export interface PushDeliveryResult {
	endpoint: string;
	success: boolean;
	error?: string;
	statusCode?: number;
}

export async function deliverPushNotification(
	record: StoredPushSubscription,
	payload: PushNotificationPayload,
): Promise<PushDeliveryResult> {
	configureWebPush();

	try {
		await webPush.sendNotification(
			toPushSubscription(record),
			JSON.stringify(payload),
			{ TTL: 60 },
		);
		return { endpoint: record.endpoint, success: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const statusCode =
			typeof (error as webPush.WebPushError)?.statusCode === "number"
				? (error as webPush.WebPushError).statusCode
				: undefined;
		return {
			endpoint: record.endpoint,
			success: false,
			error: message,
			statusCode,
		};
	}
}
