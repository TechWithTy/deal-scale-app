import { auth } from "@/auth";
import {
	pushSendPayloadSchema,
	type PushNotificationPayload,
} from "@/lib/server/push/schema";
import {
	getPushSubscriptionByEndpoint,
	getPushSubscriptionsForUser,
	removePushSubscription,
	type StoredPushSubscription,
} from "@/lib/server/push/subscriptionStore";
import { deliverPushNotification } from "@/lib/server/push/webPushClient";
import type { UserRole } from "@/types/user";
import { NextResponse } from "next/server";

function canManageNotifications(role?: UserRole | null): boolean {
	return (
		role === "admin" ||
		role === "manager" ||
		role === "platform_admin" ||
		role === "platform_support"
	);
}

function appendDeepLink(
	payload: PushNotificationPayload,
	record: StoredPushSubscription,
): PushNotificationPayload {
	const baseData = payload.data ?? {};
	const nextData: Record<string, unknown> = {
		...baseData,
		endpoint: record.endpoint,
	};
	if (payload.url && typeof nextData.url === "undefined") {
		nextData.url = payload.url;
	}
	return { ...payload, data: nextData };
}

export async function POST(request: Request): Promise<NextResponse> {
	const session = await auth();
	const userId = session?.user?.id;
	if (!userId) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch (error) {
		return NextResponse.json(
			{ message: "Invalid JSON payload" },
			{ status: 400 },
		);
	}

	const parsed = pushSendPayloadSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				message: "Invalid push payload",
				errors: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	const { target, notification } = parsed.data;
	const role = session?.user?.role as UserRole | undefined;

	let recipients: StoredPushSubscription[] = [];

	if ("endpoint" in target) {
		const record = getPushSubscriptionByEndpoint(target.endpoint);
		if (!record) {
			return NextResponse.json(
				{ message: "Subscription not found" },
				{ status: 404 },
			);
		}
		if (record.userId !== userId && !canManageNotifications(role)) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}
		recipients = [record];
	} else if ("userId" in target) {
		if (target.userId !== userId && !canManageNotifications(role)) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}
		recipients = getPushSubscriptionsForUser(target.userId);
	}

	if (recipients.length === 0) {
		return NextResponse.json(
			{ message: "No push subscriptions for target" },
			{ status: 404 },
		);
	}

	const results = await Promise.all(
		recipients.map(async (record) => {
			const enrichedPayload = appendDeepLink(notification, record);
			const result = await deliverPushNotification(record, enrichedPayload);
			if (
				!result.success &&
				(result.statusCode === 404 || result.statusCode === 410)
			) {
				removePushSubscription(record.endpoint);
			}
			return result;
		}),
	);

	const failed = results.filter((result) => !result.success);
	const status = failed.length === results.length ? 502 : 200;

	return NextResponse.json(
		{
			success: failed.length === 0,
			recipientCount: recipients.length,
			deliveries: results,
		},
		{ status },
	);
}
