import type {
	PublicApiNotificationCategory,
	PublicApiNotificationPreference,
	PublicApiNotificationPreferenceUpdateItem,
	PublicApiNotificationPreferences,
} from "@/lib/api/public-api-notifications";

export const NOTIFICATION_PREFERENCE_CATEGORIES = [
	"lead",
	"campaign",
	"team",
	"billing",
	"security",
	"integration",
	"system",
] as const satisfies readonly PublicApiNotificationCategory[];

export type NotificationPreferenceRow = Pick<
	PublicApiNotificationPreference,
	"category" | "email_enabled" | "in_app_enabled" | "sms_enabled" | "version"
>;

const EMPTY_PREFERENCE: Omit<NotificationPreferenceRow, "category"> = {
	email_enabled: false,
	in_app_enabled: true,
	sms_enabled: false,
	version: 0,
};

export function normalizeNotificationPreferences(
	payload: PublicApiNotificationPreferences,
): NotificationPreferenceRow[] {
	const byCategory = new Map(
		payload.items.map((item) => [item.category, item]),
	);
	return NOTIFICATION_PREFERENCE_CATEGORIES.map((category) => {
		const preference = byCategory.get(category);
		return preference
			? {
					category,
					email_enabled: preference.email_enabled,
					in_app_enabled: preference.in_app_enabled,
					sms_enabled: preference.sms_enabled,
					version: preference.version,
				}
			: { category, ...EMPTY_PREFERENCE };
	});
}

export function preferenceUpdate(
	row: NotificationPreferenceRow,
	channel: "email_enabled" | "in_app_enabled" | "sms_enabled",
	value: boolean,
): PublicApiNotificationPreferenceUpdateItem {
	return { ...row, [channel]: value };
}
