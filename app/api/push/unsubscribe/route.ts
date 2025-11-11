import { auth } from "@/auth";
import { pushUnsubscribeSchema } from "@/lib/server/push/schema";
import {
	getPushSubscriptionByEndpoint,
	removePushSubscription,
} from "@/lib/server/push/subscriptionStore";
import type { UserRole } from "@/types/user";
import { NextResponse } from "next/server";

function canManageSubscription(role?: UserRole | null): boolean {
	return (
		role === "admin" ||
		role === "manager" ||
		role === "platform_admin" ||
		role === "platform_support"
	);
}

export async function DELETE(request: Request): Promise<NextResponse> {
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

	const parsed = pushUnsubscribeSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				message: "Invalid unsubscribe payload",
				errors: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	const { endpoint } = parsed.data;
	const existing = getPushSubscriptionByEndpoint(endpoint);
	if (!existing) {
		return NextResponse.json({ success: true });
	}

	const role = session?.user?.role as UserRole | undefined;
	if (existing.userId !== userId && !canManageSubscription(role)) {
		return NextResponse.json({ message: "Forbidden" }, { status: 403 });
	}

	removePushSubscription(endpoint);
	return NextResponse.json({ success: true });
}
