import {
	identitySchema,
	impersonationResponseSchema,
	impersonationRestoreResponseSchema,
	sessionUserSchema,
} from "@/lib/impersonation/session-schemas";
import { getUserById, users } from "@/lib/mock-db";
import type {
	ImpersonationSessionPayload,
	ImpersonationSessionUserSnapshot,
	ImpersonationRestoreState,
} from "@/types/impersonation";
import type { User, UserRole } from "@/types/user";
import { z } from "zod";

const START_SCHEMA = z.object({
	userId: z.string().min(1, "Target user id is required"),
});

const responseSchema = impersonationResponseSchema;

const EXCHANGE_ROUTE = "/api/auth/impersonation/exchange";
const RESTORE_ROUTE = "/api/auth/impersonation/restore";

const ALLOWED_IMPERSONATOR_ROLES = new Set<UserRole>([
	"platform_admin",
	"platform_support",
]);

function shouldUseMock(): boolean {
	return process?.env?.NEXT_PUBLIC_IMPERSONATION_USE_MOCK === "true";
}

function toImpersonationIdentity(user: User) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	};
}

function toSessionSnapshot(user: User): ImpersonationSessionUserSnapshot {
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

function findMockImpersonator(targetId: string): User | undefined {
	const prioritizedAdmin = users.find(
		(user) => user.role === "platform_admin" && user.id !== targetId,
	);
	if (prioritizedAdmin) return prioritizedAdmin;

	const prioritizedSupport = users.find(
		(user) => user.role === "platform_support" && user.id !== targetId,
	);
	if (prioritizedSupport) return prioritizedSupport;

	return users.find(
		(user) => ALLOWED_IMPERSONATOR_ROLES.has(user.role) && user.id !== targetId,
	);
}

function buildMockPayload(userId: string): ImpersonationSessionPayload {
	const targetUser = getUserById(userId);
	if (!targetUser) {
		throw new Error("User not found");
	}

	const impersonator = findMockImpersonator(targetUser.id);
	if (!impersonator) {
		throw new Error(
			"No eligible impersonator configured in the mock directory",
		);
	}

	return {
		impersonator: toImpersonationIdentity(impersonator),
		impersonatedUser: toImpersonationIdentity(targetUser),
		impersonatedUserData: toSessionSnapshot(targetUser),
		impersonatorUserData: toSessionSnapshot(impersonator),
	} satisfies ImpersonationSessionPayload;
}

async function parseJson(response: Response) {
	try {
		return await response.json();
	} catch (error) {
		console.error("Failed to parse impersonation response", error);
		return null;
	}
}

function buildError(message: string, fallback: string) {
	if (message) {
		return new Error(`${fallback}: ${message}`);
	}
	return new Error(fallback);
}

export async function startImpersonationSession(
	params: z.input<typeof START_SCHEMA>,
): Promise<ImpersonationSessionPayload> {
	const parsed = START_SCHEMA.safeParse(params);
	if (!parsed.success) {
		throw new Error(
			parsed.error.issues[0]?.message ?? "Invalid impersonation request",
		);
	}

	if (shouldUseMock()) {
		return buildMockPayload(parsed.data.userId);
	}

	let response: Response;
	try {
		response = await fetch(EXCHANGE_ROUTE, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			cache: "no-store",
			body: JSON.stringify(parsed.data),
		});
	} catch (error) {
		throw buildError(
			error instanceof Error ? error.message : "",
			"Failed to start impersonation session",
		);
	}

	if (!response.ok) {
		const body = await parseJson(response);
		const message = typeof body?.error === "string" ? body.error : "";
		throw buildError(message, "Failed to start impersonation session");
	}

	const body = await parseJson(response);
	const validated = responseSchema.safeParse(body);
	if (!validated.success) {
		throw new Error("Invalid impersonation response payload");
	}

	return validated.data satisfies ImpersonationSessionPayload;
}

export async function stopImpersonationSession(): Promise<ImpersonationRestoreState | null> {
	if (shouldUseMock()) {
		return null;
	}

	let response: Response;
	try {
		response = await fetch(RESTORE_ROUTE, {
			method: "POST",
			credentials: "include",
			cache: "no-store",
		});

	} catch (error) {
		throw buildError(
			error instanceof Error ? error.message : "",
			"Failed to stop impersonation session",
		);
	}
	if (!response.ok) {
		const body = await parseJson(response);
		const message = typeof body?.error === "string" ? body.error : "";
		throw buildError(message, "Failed to stop impersonation session");
	}
	const validated = impersonationRestoreResponseSchema.safeParse(
		await parseJson(response),
	);
	if (!validated.success) throw new Error("Invalid impersonation restore payload");
	return validated.data;
}
