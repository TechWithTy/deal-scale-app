import {
	identitySchema,
	impersonationResponseSchema,
	sessionUserSchema,
} from "@/lib/impersonation/session-schemas";
import { getUserById, users } from "@/lib/mock-db";
import type {
	ImpersonationSessionPayload,
	ImpersonationSessionUserSnapshot,
} from "@/types/impersonation";
import type { User, UserRole } from "@/types/user";
import { z } from "zod";

const START_SCHEMA = z.object({
	userId: z.string().min(1, "Target user id is required"),
});

const responseSchema = impersonationResponseSchema;

const ROUTE = "/api/admin/impersonation";

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

function isMissingRouteResponse(response: Response): boolean {
	const contentType = response.headers.get("content-type") ?? "";
	const isJson = contentType.toLowerCase().includes("application/json");
	return response.status === 404 && !isJson;
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
		response = await fetch(ROUTE, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			cache: "no-store",
			body: JSON.stringify(parsed.data),
		});
	} catch (error) {
		console.warn(
			"Failed to reach impersonation API; using mock data instead.",
			error,
		);
		return buildMockPayload(parsed.data.userId);
	}

	if (!response.ok) {
		if (isMissingRouteResponse(response)) {
			console.warn(
				"Impersonation API route missing; falling back to mock implementation.",
			);
			return buildMockPayload(parsed.data.userId);
		}

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

export async function stopImpersonationSession(): Promise<void> {
	if (shouldUseMock()) {
		return;
	}

	try {
		const response = await fetch(ROUTE, {
			method: "DELETE",
			credentials: "include",
			cache: "no-store",
		});

		if (!response.ok && response.status !== 204) {
			if (isMissingRouteResponse(response)) {
				console.warn(
					"Impersonation API route missing during stop; mock cleanup assumed.",
				);
				return;
			}

			const body = await parseJson(response);
			const message = typeof body?.error === "string" ? body.error : "";
			throw buildError(message, "Failed to stop impersonation session");
		}
	} catch (error) {
		if (shouldUseMock()) {
			return;
		}
		console.warn(
			"Failed to reach impersonation API when stopping; assuming mock cleanup.",
			error,
		);
	}
}
