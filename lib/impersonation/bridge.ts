import { normalizeTier } from "@/constants/subscription/tiers";
import type {
	ImpersonationPublicApiTokens,
	ImpersonationSessionUserSnapshot,
} from "@/types/impersonation";
import type { UserRole } from "@/types/user";
import { z } from "zod";

const userRoleSchema = z.enum([
	"admin",
	"manager",
	"member",
	"support",
	"platform_admin",
	"platform_support",
]);

export const impersonationTokenSchema = z.object({
	expires_at: z.string().optional(),
	expires_in: z.number().positive(),
	session_id: z.string().min(1),
	token: z.string().min(1),
	token_type: z.string().min(1).optional(),
});

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function strings(value: unknown): string[] {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: [];
}

function number(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function bucket(value: unknown) {
	const record = asRecord(value);
	return {
		allotted: number(record.allotted ?? record.allocated ?? record.total),
		resetInDays: 30,
		used: number(record.used ?? record.total_used),
	};
}

function credits(value: unknown) {
	const record = asRecord(value);
	return {
		ai: bucket(record.ai ?? record.ai_credits),
		leads: bucket(record.leads ?? record.lead),
		skipTraces: bucket(record.skip_traces ?? record.skipTraces),
	};
}

function role(value: unknown): UserRole {
	if (value === "super_admin") return "platform_admin";
	if (value === "user") return "member";
	return userRoleSchema.safeParse(value).data ?? "member";
}

function name(record: Record<string, unknown>, email: string) {
	const direct = record.display_name ?? record.name ?? record.full_name;
	if (typeof direct === "string" && direct.trim()) return direct;
	return (
		[record.first_name, record.last_name]
			.filter(
				(part): part is string => typeof part === "string" && Boolean(part),
			)
			.join(" ") || email
	);
}

export function createSessionSnapshot(
	value: unknown,
): ImpersonationSessionUserSnapshot | null {
	const record = asRecord(value);
	const id = record.id ?? record.user_id ?? record.userId;
	const email = record.email;
	if (typeof id !== "string" || !id || typeof email !== "string" || !email) {
		return null;
	}

	const balances = credits(record.credit_balances ?? record.credits);
	const quotas = asRecord(record.quotas);
	const subscription = asRecord(record.subscription);
	const scopeList = strings(record.permissionList ?? record.scopes);
	const permissions = strings(record.permissions ?? scopeList);
	const permissionMatrix = asRecord(
		record.permissionMatrix ?? record.permissions,
	);
	return {
		email,
		id,
		isBetaTester: Boolean(
			asRecord(record.tester_flags).is_beta_tester ?? record.isBetaTester,
		),
		isFreeTier:
			record.isFreeTier === true ||
			normalizeTier(record.subscription_tier as string) === "Basic",
		isPilotTester: Boolean(
			asRecord(record.tester_flags).is_pilot_tester ?? record.isPilotTester,
		),
		name: name(record, email),
		permissionList: scopeList,
		permissionMatrix:
			permissionMatrix as ImpersonationSessionUserSnapshot["permissionMatrix"],
		permissions,
		quotas: Object.keys(quotas).length
			? (quotas as unknown as ImpersonationSessionUserSnapshot["quotas"])
			: balances,
		role: role(record.role ?? strings(record.roles)[0]),
		subscription: Object.keys(subscription).length
			? (subscription as ImpersonationSessionUserSnapshot["subscription"])
			: {
					aiCredits: balances.ai,
					leads: balances.leads,
					skipTraces: balances.skipTraces,
				},
		tier: normalizeTier(
			typeof record.tier === "string"
				? record.tier
				: typeof record.subscription_tier === "string"
					? record.subscription_tier
					: undefined,
		),
	};
}

export function tokenExpiry(expiresAt: string | undefined, expiresIn: number) {
	const parsed = expiresAt ? Date.parse(expiresAt) : Number.NaN;
	return Number.isFinite(parsed) ? parsed : Date.now() + expiresIn * 1000;
}

export function toImpersonationTokens(value: {
	expires_at?: string;
	expires_in: number;
	session_id: string;
	token: string;
	token_type?: string;
}): ImpersonationPublicApiTokens {
	return {
		accessToken: value.token,
		expiresAt: tokenExpiry(value.expires_at, value.expires_in),
		refreshToken: undefined,
		sessionId: value.session_id,
		tokenType: value.token_type ?? "bearer",
	};
}
