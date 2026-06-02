import { auth } from "@/auth";
import { getUserById, users } from "@/lib/mock-db";
import type { User, UserRole } from "@/types/user";
import { NextResponse } from "next/server";

const ALLOWED_IMPERSONATOR_ROLES = new Set<UserRole>([
	"platform_admin",
	"platform_support",
]);

export const dynamic = "force-dynamic";

function canImpersonate(role?: string | null): role is UserRole {
	return (
		role === "platform_admin" ||
		role === "platform_support" ||
		role === "admin"
	);
}

function toIdentity(user: User) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	};
}

function toSnapshot(user: User) {
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
		isFreeTier: user.isFreeTier,
	};
}

function findImpersonator(targetId: string): User | undefined {
	return (
		users.find(
			(user) =>
				ALLOWED_IMPERSONATOR_ROLES.has(user.role) && user.id !== targetId,
		) ??
		users.find(
			(user) => user.role === "platform_admin" && user.id !== targetId,
		) ??
		users.find((user) => user.role === "platform_support" && user.id !== targetId)
	);
}

export async function POST(request: Request) {
	const session = await auth();
	const role = session?.user?.role as string | undefined;

	if (!canImpersonate(role)) {
		return NextResponse.json({ error: "Not authorized" }, { status: 403 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
	}

	const userId =
		typeof body === "object" && body && "userId" in body
			? (body as { userId?: unknown }).userId
			: undefined;

	if (typeof userId !== "string" || !userId.trim()) {
		return NextResponse.json(
			{ error: "Target user id is required" },
			{ status: 400 },
		);
	}

	const targetUser = getUserById(userId);
	if (!targetUser) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const impersonator = findImpersonator(targetUser.id);
	if (!impersonator) {
		return NextResponse.json(
			{ error: "No eligible impersonator configured" },
			{ status: 500 },
		);
	}

	return NextResponse.json({
		impersonatedUser: toIdentity(targetUser),
		impersonator: toIdentity(impersonator),
		impersonatedUserData: toSnapshot(targetUser),
		impersonatorUserData: toSnapshot(impersonator),
	});
}

export async function DELETE() {
	return new Response(null, { status: 204 });
}
