import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getUserByEmail, getUserById } from "@/lib/mock-db";
import type { User } from "@/types/user";
import type { ImpersonationSessionPayload } from "@/types/impersonation";
import type { NextAuthUser } from "next-auth";

const START_SCHEMA = z.object({
	userId: z.string().min(1, "Target user id is required"),
});

const ALLOWED_ROLES = new Set(["platform_admin", "platform_support"] as const);

function toImpersonationIdentity(user: User) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	};
}

function toSessionUser(user: User): NextAuthUser & {
	id: string;
	role: User["role"];
	tier: User["tier"];
	permissions: string[];
	permissionMatrix: User["permissions"];
	permissionList: string[];
	quotas: User["quotas"];
	subscription: User["subscription"];
	isBetaTester?: boolean;
	isPilotTester?: boolean;
} {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		tier: user.tier,
		permissions: user.permissionList,
		permissionMatrix: user.permissions,
		permissionList: user.permissionList,
		quotas: user.quotas,
		subscription: user.subscription,
		isBetaTester: user.isBetaTester,
		isPilotTester: user.isPilotTester,
	};
}

function findUserByIdentity(identity?: {
	id?: string | null;
	email?: string | null;
}) {
	if (!identity) return undefined;
	if (identity.id) {
		const byId = getUserById(identity.id);
		if (byId) return byId;
	}
	if (identity.email) {
		return getUserByEmail(identity.email);
	}
	return undefined;
}

export async function POST(request: Request) {
	const session = await auth();
	if (!session?.user?.role || !ALLOWED_ROLES.has(session.user.role)) {
		return NextResponse.json({ error: "Not authorized" }, { status: 403 });
	}

	const body = await request.json().catch(() => ({}));
	const parsed = START_SCHEMA.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: parsed.error.issues[0]?.message ?? "Invalid request" },
			{ status: 400 },
		);
	}

	const targetUser = getUserById(parsed.data.userId);
	if (!targetUser) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const impersonatorSource =
		findUserByIdentity(session.impersonator) ??
		findUserByIdentity({
			id: session.user.id,
			email: session.user.email,
		});

	if (!impersonatorSource) {
		return NextResponse.json(
			{ error: "Original admin account not found" },
			{ status: 404 },
		);
	}

	const impersonatorIdentity = toImpersonationIdentity(impersonatorSource);
	const impersonatedIdentity = toImpersonationIdentity(targetUser);

	await auth().update({
		user: toSessionUser(targetUser),
		impersonation: { impersonator: impersonatorIdentity },
	});

	const payload: ImpersonationSessionPayload = {
		impersonator: impersonatorIdentity,
		impersonatedUser: impersonatedIdentity,
	};

	return NextResponse.json(payload, { status: 200 });
}

export async function DELETE() {
	const session = await auth();
	if (!session) {
		return new NextResponse(null, { status: 204 });
	}

	const impersonatorIdentity = session.impersonator;
	if (!impersonatorIdentity) {
		return new NextResponse(null, { status: 204 });
	}

	const originalUser = findUserByIdentity(impersonatorIdentity);
	if (!originalUser) {
		return NextResponse.json(
			{ error: "Original admin account not found" },
			{ status: 404 },
		);
	}

	await auth().update({
		user: toSessionUser(originalUser),
		impersonation: { impersonator: null },
	});

	return new NextResponse(null, { status: 204 });
}
