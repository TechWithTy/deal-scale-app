import { z } from "zod";
import { getUserById, users } from "@/lib/mock-db";
import type { User } from "@/types/user";
import type {
	ImpersonationIdentity,
	ImpersonationSessionPayload,
} from "@/types/impersonation";

const START_SCHEMA = z.object({
	userId: z.string().min(1, "Target user id is required"),
});

const ALLOWED_IMPERSONATOR_ROLES = new Set<User["role"]>([
	"platform_admin",
	"platform_support",
]);

function toIdentity(user: User): ImpersonationIdentity {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	};
}

function findMockImpersonator(targetId: string): User | null {
	const candidate = users.find(
		(user) => ALLOWED_IMPERSONATOR_ROLES.has(user.role) && user.id !== targetId,
	);

	if (candidate) return candidate;
	return users.find((user) => user.id !== targetId) ?? null;
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

	const target = getUserById(parsed.data.userId);
	if (!target) {
		throw new Error("User not found");
	}

	const impersonator = findMockImpersonator(target.id);
	if (!impersonator) {
		throw new Error("No impersonator available in mock data");
	}

	return {
		impersonatedUser: toIdentity(target),
		impersonator: toIdentity(impersonator),
	};
}

export async function stopImpersonationSession(): Promise<void> {
	// Mock implementation: nothing to do besides resolving the promise.
	return Promise.resolve();
}
