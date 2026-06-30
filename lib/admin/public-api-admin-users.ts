import type {
	AdminUser,
	AdminUserCreditsBucket,
	AdminUserRole,
} from "@/components/tables/super-users/types";
import type { AdminActivityEvent } from "@/lib/admin/user-directory";

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
	return role && ROLES.has(role as AdminUserRole)
		? (role as AdminUserRole)
		: "user";
}

function normalizeStatus(value: unknown): AdminUser["status"] {
	const status = asString(value);
	return status && STATUSES.has(status as NonNullable<AdminUser["status"]>)
		? (status as AdminUser["status"])
		: "active";
}

function normalizeBucket(value: unknown): AdminUserCreditsBucket {
	const record = asRecord(value);
	return {
		allotted: asNumber(record.allotted ?? record.allocated ?? record.total),
		used: asNumber(record.used),
	};
}

function normalizeCredits(value: unknown): AdminUser["credits"] | undefined {
	const record = asRecord(value);
	if (!Object.keys(record).length) return undefined;
	return {
		ai: normalizeBucket(record.ai ?? record.aiCredits ?? record.ai_credits),
		leads: normalizeBucket(record.leads),
		skipTraces: normalizeBucket(
			record.skipTraces ?? record.skip_traces ?? record.skipTrace,
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
		role: normalizeRole(record.role),
		status: normalizeStatus(record.status),
		suspensionDate: asString(record.suspensionDate ?? record.suspension_date),
		unsuspendDate: asString(record.unsuspendDate ?? record.unsuspend_date),
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
