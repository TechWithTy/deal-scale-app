type SubscriptionMetadata = Record<
	string,
	string | number | boolean | null | undefined
>;

interface PersistResponse {
	success: boolean;
	message?: string;
}

export interface SendNotificationResponse extends PersistResponse {
	recipientCount?: number;
	deliveries?: Array<{
		endpoint: string;
		success: boolean;
		error?: string;
		statusCode?: number;
	}>;
}

function buildHeaders() {
	return {
		"Content-Type": "application/json",
	};
}

export async function persistSubscription(
	subscription: PushSubscriptionJSON,
	metadata?: SubscriptionMetadata,
): Promise<PersistResponse> {
	const response = await fetch("/api/push/subscribe", {
		method: "POST",
		headers: buildHeaders(),
		body: JSON.stringify({ subscription, metadata }),
	});

	if (!response.ok) {
		const message = await safeParseMessage(response);
		throw new Error(message ?? "Failed to persist push subscription");
	}

	return (await response.json().catch(() => ({}))) as PersistResponse;
}

export async function removeSubscription(
	endpoint: string | null,
): Promise<PersistResponse> {
	if (!endpoint) {
		return { success: true };
	}

	const response = await fetch("/api/push/unsubscribe", {
		method: "DELETE",
		headers: buildHeaders(),
		body: JSON.stringify({ endpoint }),
	});

	if (!response.ok) {
		const message = await safeParseMessage(response);
		throw new Error(message ?? "Failed to remove push subscription");
	}

	return (await response.json().catch(() => ({}))) as PersistResponse;
}

async function safeParseMessage(
	response: Response,
): Promise<string | undefined> {
	try {
		const data = await response.json();
		if (typeof data?.message === "string") return data.message;
	} catch (error) {
		console.warn("Failed to parse push API error response", error);
	}
	return undefined;
}

export function getVapidPublicKey(): string | undefined {
	return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
}

export async function sendPushNotification<TPayload extends object>(
	payload: TPayload,
): Promise<SendNotificationResponse> {
	const response = await fetch("/api/push/send", {
		method: "POST",
		headers: buildHeaders(),
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const message = await safeParseMessage(response);
		throw new Error(message ?? "Failed to send push notification");
	}

	return (await response.json().catch(() => ({}))) as SendNotificationResponse;
}
