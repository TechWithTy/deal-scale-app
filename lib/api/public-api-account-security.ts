import { publicApiFetch } from "@/lib/api/public-api-client";

type PublicApiPage<T> = {
	items: T[];
	page: {
		has_more: boolean;
		next_cursor: string | null;
		previous_cursor: string | null;
		total: number;
	};
};

export type PublicApiSession = {
	browser?: string | null;
	created_at?: string | null;
	current?: boolean;
	device?: string | null;
	device_type?: string | null;
	expires_at?: string | null;
	id?: string;
	ip?: string | null;
	ip_address?: string | null;
	is_current?: boolean;
	is_mobile?: boolean;
	last_active?: string | null;
	last_active_at?: string | null;
	last_accessed_at?: string | null;
	location?: string | null;
	location_city?: string | null;
	location_country?: string | null;
	os?: string | null;
	platform?: string | null;
	session_id?: string;
	status?: "active" | "expired" | "revoked" | "unknown";
	user_agent?: string | null;
};

export type PublicApiSecurityActivity = {
	created_at?: string | null;
	description?: string | null;
	device?: string | null;
	event_type?: string;
	id?: string;
	ip?: string | null;
	ip_address?: string | null;
	location?: string | null;
	location_city?: string | null;
	location_country?: string | null;
	metadata?: Record<string, unknown>;
	status?: string | null;
	successful?: boolean | null;
	timestamp?: string | null;
	type?: string;
	user_agent?: string | null;
};

export type PublicApiDataExportType =
	| "activity"
	| "billing"
	| "full_account"
	| "profile";

export type PublicApiDataExportRequest = {
	export_type?: PublicApiDataExportType;
	format?: "json";
};

export type PublicApiDataExportResponse = {
	download_url?: string | null;
	expires_at?: string | null;
	export_type: PublicApiDataExportType;
	format: "json";
	message: string;
	request_id: string;
	requested_at: string;
	status: "failed" | "processing" | "queued" | "ready";
};

export type PublicApiAccountDeletionRequest = {
	confirmation: "DELETE";
	password?: string;
	reason?: string;
};

export type PublicApiAccountDeletionResponse = {
	can_be_cancelled_until: string;
	message: string;
	request_id: string;
	requested_at: string;
	scheduled_deletion_at: string;
	status: "cancelled" | "completed" | "pending_verification" | "scheduled";
};

export function listAccountSessions(token?: string, sessionId?: string) {
	return publicApiFetch<PublicApiPage<PublicApiSession>>(
		"/api/v1/auth/sessions",
		{
			headers: sessionId ? { "x-session-id": sessionId } : undefined,
			token,
		},
	);
}

export function revokeAccountSession(sessionId: string, token?: string) {
	return publicApiFetch<unknown>(
		`/api/v1/auth/sessions/${encodeURIComponent(sessionId)}`,
		{ method: "DELETE", token },
	);
}

export function revokeOtherAccountSessions(
	sessionIds: string[],
	token?: string,
) {
	return Promise.all(
		sessionIds.map((sessionId) => revokeAccountSession(sessionId, token)),
	);
}

export function getSecurityActivity(token?: string) {
	return publicApiFetch<PublicApiPage<PublicApiSecurityActivity>>(
		"/api/v1/auth/security-activity",
		{ token },
	);
}

export function requestDataExport(
	body: PublicApiDataExportRequest,
	token?: string,
) {
	return publicApiFetch<PublicApiDataExportResponse>(
		"/api/v1/account/data-export",
		{
			body,
			method: "POST",
			token,
		},
	);
}

export function requestAccountDeletion(
	body: PublicApiAccountDeletionRequest,
	token?: string,
) {
	return publicApiFetch<PublicApiAccountDeletionResponse>("/api/v1/account", {
		body,
		method: "DELETE",
		token,
	});
}
