import { auth } from "@/auth";
import { pushSubscriptionPayloadSchema } from "@/lib/server/push/schema";
import { upsertPushSubscription } from "@/lib/server/push/subscriptionStore";
import { NextResponse } from "next/server";

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

	const result = pushSubscriptionPayloadSchema.safeParse(payload);
	if (!result.success) {
		return NextResponse.json(
			{
				message: "Invalid push subscription payload",
				errors: result.error.flatten(),
			},
			{ status: 400 },
		);
	}

	const { subscription, metadata } = result.data;
	upsertPushSubscription({
		endpoint: subscription.endpoint,
		keys: subscription.keys,
		userId,
		createdAt: new Date().toISOString(),
		expirationTime: subscription.expirationTime ?? null,
		metadata: metadata ?? null,
	});

	return NextResponse.json({ success: true });
}
