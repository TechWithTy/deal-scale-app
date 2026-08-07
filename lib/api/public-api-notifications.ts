import { publicApiFetch } from "@/lib/api/public-api-client";

export type PublicApiNotificationCategory =
	| "billing"
	| "campaign"
	| "integration"
	| "lead"
	| "security"
	| "system"
	| "team";

export type PublicApiNotificationChannel = "email" | "in_app" | "sms";
export type PublicApiNotificationDeliveryState =
	| "delivered"
	| "failed"
	| "pending"
	| "sent"
	| "suppressed";

export type PublicApiNotification = {
	body?: string | null;
	category: PublicApiNotificationCategory;
	created_at: string;
	deep_link_url?: string | null;
	delivery_channels: PublicApiNotificationChannel[];
	delivery_state: PublicApiNotificationDeliveryState;
	expires_at?: string | null;
	id: string;
	metadata?: Record<string, boolean | number | string | null>;
	organization_id: string;
	read_at?: string | null;
	source_resource_id?: string | null;
	source_resource_type?: string | null;
	title: string;
	updated_at: string;
	user_id: string;
	version: number;
};

export type PublicApiNotificationsPage = {
	items?: PublicApiNotification[];
	limit?: number;
	offset?: number;
	total?: number;
};

export type PublicApiNotificationPreference = {
	category: PublicApiNotificationCategory;
	created_at?: string | null;
	email_enabled: boolean;
	id?: string | null;
	in_app_enabled: boolean;
	organization_id: string;
	sms_enabled: boolean;
	updated_at?: string | null;
	user_id: string;
	version: number;
};

export type PublicApiNotificationPreferences = {
	items: PublicApiNotificationPreference[];
};

export type PublicApiNotificationPreferenceUpdateItem = {
	category: PublicApiNotificationCategory;
	email_enabled?: boolean;
	in_app_enabled?: boolean;
	sms_enabled?: boolean;
	version?: number;
};

type NotificationParams = {
	category?: PublicApiNotificationCategory;
	limit?: number;
	offset?: number;
	unread_only?: boolean;
};

function withQuery(pathname: string, params?: NotificationParams) {
	if (!params) return pathname;
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		search.set(key, String(value));
	}
	const query = search.toString();
	return query ? `${pathname}?${query}` : pathname;
}

function encodeId(id: string) {
	return encodeURIComponent(id);
}

export function listNotifications(params?: NotificationParams, token?: string) {
	return publicApiFetch<PublicApiNotificationsPage>(
		withQuery("/api/v1/notifications", params),
		{ token },
	);
}

export function getNotificationUnreadCount(
	category?: PublicApiNotificationCategory,
	token?: string,
) {
	return publicApiFetch<{ unread_count: number }>(
		withQuery("/api/v1/notifications/unread-count", { category }),
		{ token },
	);
}

export function markNotificationRead(notificationId: string, token?: string) {
	return publicApiFetch<{
		notification_id: string;
		read_at: string;
		version: number;
	}>(`/api/v1/notifications/${encodeId(notificationId)}/read`, {
		method: "POST",
		token,
	});
}

export function markAllNotificationsRead(
	body?: { category?: PublicApiNotificationCategory },
	token?: string,
) {
	return publicApiFetch<{ marked_read: number; read_at: string }>(
		"/api/v1/notifications/read-all",
		{ body, method: "POST", token },
	);
}

export function listNotificationPreferences(token?: string) {
	return publicApiFetch<PublicApiNotificationPreferences>(
		"/api/v1/notification-preferences",
		{ token },
	);
}

export function updateNotificationPreferences(
	items: PublicApiNotificationPreferenceUpdateItem[],
	token?: string,
) {
	return publicApiFetch<PublicApiNotificationPreferences>(
		"/api/v1/notification-preferences",
		{ body: { items }, method: "PUT", token },
	);
}
