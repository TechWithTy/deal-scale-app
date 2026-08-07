import type { PublicApiNotification } from "@/lib/api/public-api-notifications";
import type { AppNotification } from "@/lib/stores/notificationsStore";

const categoryIcons: Record<PublicApiNotification["category"], string> = {
	billing: "$",
	campaign: "!",
	integration: "+",
	lead: "*",
	security: "#",
	system: "i",
	team: "@",
};

const categoryColors: Record<PublicApiNotification["category"], string> = {
	billing: "142 76% 36%",
	campaign: "24 95% 50%",
	integration: "200 85% 45%",
	lead: "258 84% 54%",
	security: "0 72% 51%",
	system: "46 100% 50%",
	team: "220 70% 50%",
};

export function toAppNotification(
	notification: PublicApiNotification,
): AppNotification {
	return {
		id: notification.id,
		title: notification.title,
		description: notification.body ?? undefined,
		icon: categoryIcons[notification.category],
		colorHsl: categoryColors[notification.category],
		createdAt: new Date(notification.created_at).getTime(),
		unread: !notification.read_at,
	};
}
