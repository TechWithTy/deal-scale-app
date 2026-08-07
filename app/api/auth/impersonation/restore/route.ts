import { auth } from "@/auth";
import { publicApiServerFetch } from "@/lib/api/public-api-server";
import type { ImpersonationRestoreState } from "@/types/impersonation";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function restoreState(value: unknown): ImpersonationRestoreState | null {
	if (!value || typeof value !== "object") return null;
	const state = value as Partial<ImpersonationRestoreState>;
	return state.publicApi?.accessToken && state.user?.id
		? (state as ImpersonationRestoreState)
		: null;
}

export async function POST(request: Request) {
	const session = await auth();
	if (!session?.impersonator || !session.user?.id) {
		return NextResponse.json(
			{ error: "No impersonation session is active" },
			{ status: 409 },
		);
	}

	const token = await getToken({
		req: request,
		secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
	});
	const restore = restoreState(token?.impersonationRestore);
	const sessionId = session.publicApi?.sessionId;
	if (!restore || !sessionId) {
		return NextResponse.json(
			{ error: "Impersonation restore state is unavailable" },
			{ status: 409 },
		);
	}

	try {
		await publicApiServerFetch(
			`/api/v1/admin/users/${encodeURIComponent(session.user.id)}/end-impersonation?session_id=${encodeURIComponent(sessionId)}`,
			{ method: "POST", token: restore.publicApi.accessToken },
		);
		return NextResponse.json({
			publicApi: restore.publicApi,
			user: restore.user,
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unable to restore the administrator session";
		return NextResponse.json({ error: message }, { status: 502 });
	}
}
