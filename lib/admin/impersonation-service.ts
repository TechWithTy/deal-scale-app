import { z } from "zod";
import { getUserById, users } from "@/lib/mock-db";
import type { User, UserRole } from "@/types/user";
import type {
	ImpersonationIdentity,
	ImpersonationSessionPayload,
} from "@/types/impersonation";

const START_SCHEMA = z.object({
	userId: z.string().min(1, "Target user id is required"),
});

const PREFERRED_IMPERSONATOR_ROLES: UserRole[] = [
	"platform_admin",
	"admin",
	"platform_support",
	"support",
	"manager",
	"member",
];

function toIdentity(user: User): ImpersonationIdentity {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	} satisfies ImpersonationIdentity;
}

function findMockImpersonator(targetId: string): User | null {
	for (const role of PREFERRED_IMPERSONATOR_ROLES) {
		const candidate = users.find(
			(user) => user.role === role && user.id !== targetId,
		);
		if (candidate) {
			return candidate;
		}
	}

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
	} satisfies ImpersonationSessionPayload;
}

export async function stopImpersonationSession(): Promise<void> {
	return Promise.resolve();
}
