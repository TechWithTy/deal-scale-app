import type {
	AdminUser,
	AdminUserCreditsBucket,
	AdminUserRole,
} from "@/components/tables/super-users/types";
import { normalizeTier } from "@/constants/subscription/tiers";
import type {
	AdminActivityEvent,
	AdminDirectoryUser,
} from "@/lib/admin/user-directory";
import type { PermissionMatrix, User } from "@/types/user";

export type PublicApiAdminDetailSource = "fallback" | "live" | "missing_token";

const ROLES = new Set<AdminUserRole>([
	"admin",
	"platform_admin",
	"platform_support",
	"support",
	"user",
]);

const STATUSES = new Set<NonNullable<AdminUser["status"]>>([
	"active",
	"banned",
	"disabled",
	"failed",
	"pending",
	"suspended",
]);

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function asString(value: unknown) {
	return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function splitName(name?: string) {
	const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
	return {
		firstName: parts[0],
		lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
	};
}

function normalizeRole(value: unknown): AdminUserRole {
	const role = asString(value);
	if (role === "super_admin") return "platform_admin";
	return role && ROLES.has(role as AdminUserRole)
		? (role as AdminUserRole)
		: "user";
}

function normalizeStatus(value: unknown): AdminUser["status"] {
	const status = asString(value);
	if (status === "inactive") return "disabled";
	return status && STATUSES.has(status as NonNullable<AdminUser["status"]>)
		? (status as AdminUser["status"])
		: "active";
}

function normalizeBucket(value: unknown): AdminUserCreditsBucket {
	const record = asRecord(value);
	const used = asNumber(record.used ?? record.total_used);
	const available = asNumber(record.available_credits);
	const reserved = asNumber(record.reserved_credits);
	const purchased = asNumber(record.total_purchased);
	return {
		allotted:
			asNumber(record.allotted ?? record.allocated ?? record.total) ||
			Math.max(purchased, available + reserved + used),
		used,
	};
}

function normalizeCredits(value: unknown): AdminUser["credits"] | undefined {
	const record = asRecord(value);
	if (!Object.keys(record).length) return undefined;
	return {
		ai: normalizeBucket(record.ai ?? record.aiCredits ?? record.ai_credits),
		leads: normalizeBucket(record.leads ?? record.lead),
		skipTraces: normalizeBucket(
			record.skipTraces ??
				record.skip_traces ??
				record.skipTrace ??
				record.skip_trace,
		),
	};
}

export function mapPublicApiAdminUser(value: unknown): AdminUser | null {
	const record = asRecord(value);
	const id = asString(record.id ?? record.user_id ?? record.userId);
	const email = asString(record.email);
	if (!id || !email) return null;

	const fullName = asString(record.name ?? record.full_name ?? record.fullName);
	const names = splitName(fullName);
	const roles = strings(record.roles);
	return {
		credits: normalizeCredits(record.credits ?? record.credit_balances),
		email,
		firstName:
			asString(record.firstName ?? record.first_name ?? record.given_name) ??
			names.firstName,
		id,
		lastName:
			asString(record.lastName ?? record.last_name ?? record.family_name) ??
			names.lastName,
		phone: asString(record.phone ?? record.phone_number ?? record.phoneNumber),
		role: normalizeRole(record.role ?? roles[0]),
		status: normalizeStatus(record.status),
		suspensionDate: asString(record.suspensionDate ?? record.suspension_date),
		unsuspendDate: asString(record.unsuspendDate ?? record.unsuspend_date),
	};
}

function strings(value: unknown): string[] {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: [];
}

function defaultCredits(): NonNullable<AdminUser["credits"]> {
	return {
		ai: { allotted: 0, used: 0 },
		leads: { allotted: 0, used: 0 },
		skipTraces: { allotted: 0, used: 0 },
	};
}

function quotasFromCredits(
	credits: NonNullable<AdminUser["credits"]>,
): User["quotas"] {
	return {
		ai: { ...credits.ai, resetInDays: 30 },
		leads: { ...credits.leads, resetInDays: 30 },
		skipTraces: { ...credits.skipTraces, resetInDays: 30 },
	};
}

function subscriptionFromCredits(
	credits: NonNullable<AdminUser["credits"]>,
): User["subscription"] {
	return {
		aiCredits: { ...credits.ai, resetInDays: 30 },
		leads: { ...credits.leads, resetInDays: 30 },
		skipTraces: { ...credits.skipTraces, resetInDays: 30 },
	};
}

export function mapPublicApiAdminDirectoryUser(
	value: unknown,
	fallback: AdminDirectoryUser | null = null,
): AdminDirectoryUser | null {
	const tableUser = mapPublicApiAdminUser(value);
	if (!tableUser) return fallback;

	const record = asRecord(value);
	const testerFlags = asRecord(record.tester_flags);
	const fullName =
		asString(record.display_name ?? record.name ?? record.full_name) ??
		`${tableUser.firstName ?? ""} ${tableUser.lastName ?? ""}`.trim() ??
		tableUser.email;
	const credits = tableUser.credits ?? fallback?.credits ?? defaultCredits();
	const scopes = strings(record.scopes);
	const roles = strings(record.roles);

	return {
		...fallback,
		...tableUser,
		credits,
		isBetaTester:
			typeof testerFlags.is_beta_tester === "boolean"
				? testerFlags.is_beta_tester
				: fallback?.isBetaTester,
		isFreeTier:
			normalizeTier(record.subscription_tier as string | undefined) === "Basic",
		isPilotTester:
			typeof testerFlags.is_pilot_tester === "boolean"
				? testerFlags.is_pilot_tester
				: fallback?.isPilotTester,
		name: fullName || tableUser.email,
		permissionList: scopes.length ? scopes : (fallback?.permissionList ?? []),
		permissionMatrix: fallback?.permissionMatrix ?? ({} as PermissionMatrix),
		quotas: fallback?.quotas ?? quotasFromCredits(credits),
		role: normalizeRole(tableUser.role ?? roles[0]),
		subscription: fallback?.subscription ?? subscriptionFromCredits(credits),
		tier: normalizeTier(record.subscription_tier as string | undefined),
	};
}

function extractArray(payload: unknown): unknown[] {
	if (Array.isArray(payload)) return payload;
	const record = asRecord(payload);
	for (const key of ["users", "results", "items", "data"]) {
		const value = record[key];
		if (Array.isArray(value)) return value;
	}
	const nestedData = asRecord(record.data);
	for (const key of ["users", "results", "items"]) {
		const value = nestedData[key];
		if (Array.isArray(value)) return value;
	}
	return [];
}

export function extractPublicApiAdminUsers(payload: unknown): AdminUser[] {
	return extractArray(payload).flatMap((item) => {
		const mapped = mapPublicApiAdminUser(item);
		return mapped ? [mapped] : [];
	});
}

export function extractPublicApiAdminLogs(
	payload: unknown,
): AdminActivityEvent[] {
	const record = asRecord(payload);
	const events = Array.isArray(record.events)
		? record.events
		: Array.isArray(payload)
			? payload
			: [];

	return events.flatMap((value, index) => {
		const event = asRecord(value);
		const at = asString(
			event.at ?? event.created_at ?? event.timestamp ?? event.occurred_at,
		);
		if (!at) return [];
		const eventType = asString(event.event_type ?? event.type ?? event.action);
		const message =
			asString(event.message ?? event.description ?? event.summary) ??
			eventType?.replaceAll("_", " ") ??
			"Admin event";
		return [
			{
				id:
					asString(event.id ?? event.event_id) ?? `${at}-${eventType ?? index}`,
				at,
				message,
			},
		];
	});
}
