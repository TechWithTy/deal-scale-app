import type {
	PublicApiSecurityActivity,
	PublicApiSession,
} from "@/lib/api/public-api-account-security";

export type SessionView = {
	browser: "chrome" | "firefox" | "safari" | "other";
	device: "desktop" | "mobile" | "tablet";
	id: string;
	ip: string;
	isCurrent: boolean;
	lastActive: string;
	location: string;
	os: string;
};

export type ActivityLogView = {
	description: string;
	device: string;
	id: string;
	ip: string;
	location: string;
	status: "failed" | "success" | "warning";
	timestamp: string;
	type:
		| "2fa_disabled"
		| "2fa_enabled"
		| "api_key_created"
		| "login"
		| "logout"
		| "password_change"
		| "settings_changed";
};

function asRecord(value: unknown) {
	return typeof value === "object" && value
		? (value as Record<string, unknown>)
		: {};
}

export function unwrapList<T>(payload: unknown): T[] {
	if (Array.isArray(payload)) return payload as T[];
	const record = asRecord(payload);
	for (const key of ["items", "results", "data", "sessions", "activities"]) {
		const value = record[key];
		if (Array.isArray(value)) return value as T[];
	}
	return [];
}

function normalizeBrowser(value?: string | null): SessionView["browser"] {
	const lower = (value ?? "").toLowerCase();
	if (lower.includes("chrome")) return "chrome";
	if (lower.includes("firefox")) return "firefox";
	if (lower.includes("safari")) return "safari";
	return "other";
}

function normalizeDevice(value?: string | null): SessionView["device"] {
	const lower = (value ?? "").toLowerCase();
	if (lower.includes("mobile") || lower.includes("phone")) return "mobile";
	if (lower.includes("tablet") || lower.includes("ipad")) return "tablet";
	return "desktop";
}

function formatLocation(
	location?: string | null,
	city?: string | null,
	country?: string | null,
) {
	const parts = [city, country].filter(Boolean);
	return location ?? (parts.length ? parts.join(", ") : "Unknown");
}

function normalizeStatus(value?: string | null): ActivityLogView["status"] {
	const lower = (value ?? "").toLowerCase();
	if (lower.includes("fail") || lower.includes("error")) return "failed";
	if (lower.includes("warn") || lower.includes("suspicious")) return "warning";
	return "success";
}

function humanizeEventType(value?: string) {
	const text = (value ?? "Security activity").replaceAll("_", " ");
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function normalizeActivityType(value?: string): ActivityLogView["type"] {
	const lower = (value ?? "").toLowerCase();
	if (lower.includes("logout")) return "logout";
	if (lower.includes("password")) return "password_change";
	if (lower.includes("2fa") && lower.includes("disable")) return "2fa_disabled";
	if (lower.includes("2fa")) return "2fa_enabled";
	if (lower.includes("api")) return "api_key_created";
	if (lower.includes("setting")) return "settings_changed";
	return "login";
}

function formatDate(value?: string | null) {
	if (!value) return "Unknown";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function normalizeSession(item: PublicApiSession): SessionView | null {
	const id = item.id ?? item.session_id;
	if (!id) return null;
	const userAgent = item.user_agent ?? "";
	return {
		browser: normalizeBrowser(item.browser ?? userAgent),
		device: item.is_mobile
			? "mobile"
			: normalizeDevice(item.device_type ?? item.device ?? userAgent),
		id,
		ip: item.ip_address ?? item.ip ?? "Unknown",
		isCurrent: Boolean(item.current ?? item.is_current),
		lastActive: formatDate(
			item.last_accessed_at ?? item.last_active_at ?? item.last_active,
		),
		location: formatLocation(
			item.location,
			item.location_city,
			item.location_country,
		),
		os: item.platform ?? item.os ?? item.device ?? "Unknown device",
	};
}

export function normalizeActivity(
	item: PublicApiSecurityActivity,
): ActivityLogView | null {
	const id =
		item.id ??
		`${item.event_type ?? item.type}-${item.timestamp ?? item.created_at}`;
	if (!id) return null;
	const eventType = item.event_type ?? item.type;
	return {
		description: item.description ?? humanizeEventType(eventType),
		device: item.device ?? item.user_agent ?? "Unknown",
		id,
		ip: item.ip_address ?? item.ip ?? "Unknown",
		location: formatLocation(
			item.location,
			item.location_city,
			item.location_country,
		),
		status:
			item.successful === false
				? "failed"
				: item.successful === true
					? "success"
					: normalizeStatus(item.status),
		timestamp: formatDate(item.timestamp ?? item.created_at),
		type: normalizeActivityType(eventType),
	};
}
