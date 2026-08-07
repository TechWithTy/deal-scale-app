import { auth } from "@/auth";
import { publicApiServerFetch } from "@/lib/api/public-api-server";
import {
	createSessionSnapshot,
	impersonationTokenSchema,
	toImpersonationTokens,
} from "@/lib/impersonation/bridge";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function canImpersonate(role?: string) {
	return (
		role === "admin" || role === "platform_admin" || role === "platform_support"
	);
}

export async function POST(request: Request) {
	const session = await auth();
	const adminToken = session?.publicApi?.accessToken;
	if (!session?.user || !adminToken) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 },
		);
	}
	if (!canImpersonate(session.user.role)) {
		return NextResponse.json({ error: "Not authorized" }, { status: 403 });
	}
	if (session.impersonator) {
		return NextResponse.json(
			{ error: "Nested impersonation is not allowed" },
			{ status: 409 },
		);
	}

	const body = await request.json().catch(() => null);
	const userId =
		body &&
		typeof body === "object" &&
		typeof (body as { userId?: unknown }).userId === "string"
			? (body as { userId: string }).userId.trim()
			: "";
	if (!userId) {
		return NextResponse.json(
			{ error: "Target user id is required" },
			{ status: 400 },
		);
	}

	try {
		const targetDetail = await publicApiServerFetch<unknown>(
			`/api/v1/admin/users/${encodeURIComponent(userId)}`,
			{ token: adminToken },
		);
		const target = createSessionSnapshot(targetDetail);
		const impersonator = createSessionSnapshot(session.user);
		if (!target || !impersonator) {
			return NextResponse.json(
				{ error: "Incomplete impersonation identity" },
				{ status: 502 },
			);
		}
		const result = impersonationTokenSchema.parse(
			await publicApiServerFetch<unknown>(
				`/api/v1/admin/users/${encodeURIComponent(userId)}/impersonate`,
				{ method: "POST", token: adminToken },
			),
		);
		const publicApi = toImpersonationTokens(result);
		return NextResponse.json({
			impersonatedUser: {
				email: target.email,
				id: target.id,
				name: target.name,
			},
			impersonatedUserData: target,
			impersonator: {
				email: impersonator.email,
				id: impersonator.id,
				name: impersonator.name,
			},
			impersonatorUserData: impersonator,
			publicApi,
			sessionId: result.session_id,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unable to start impersonation";
		return NextResponse.json({ error: message }, { status: 502 });
	}
}
