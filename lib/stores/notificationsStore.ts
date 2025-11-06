import { create } from "zustand";

export type AppNotification = {
	id: string;
	title: string;
	description?: string;
	icon?: string;
	colorHsl?: string; // hsl triplet to tint icon/border
	createdAt: number;
	unread?: boolean;
	actionId?: string;
	approveLabel?: string;
	denyLabel?: string;
};

type NotificationsState = {
	notifications: AppNotification[];
	add: (n: Omit<AppNotification, "id" | "createdAt">) => AppNotification;
	dismiss: (id: string) => void;
	clearAll: () => void;
	markRead: (id: string) => void;
	markAllRead: () => void;
	hasUnread: () => boolean;
	// action handlers keyed by actionId
	_actions: Record<string, { onApprove?: () => void; onDeny?: () => void }>;
	approve: (id: string) => void;
	deny: (id: string) => void;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
	notifications: [],
	_actions: {},
	add: (n) => {
		// extract optional action handlers (if provided via cast)
		const maybeAction = (
			n as unknown as {
				action?: {
					onApprove?: () => void;
					onDeny?: () => void;
					approveLabel?: string;
					denyLabel?: string;
				};
			}
		).action;
		const actionId = maybeAction ? crypto.randomUUID() : undefined;
		const newItem: AppNotification = {
			...n,
			id: crypto.randomUUID(),
			createdAt: Date.now(),
			unread: true,
			actionId,
			approveLabel: maybeAction?.approveLabel,
			denyLabel: maybeAction?.denyLabel,
		};
		set((s) => ({
			notifications: [newItem, ...s.notifications],
			_actions: actionId
				? {
						...s._actions,
						[actionId]: {
							onApprove: maybeAction?.onApprove,
							onDeny: maybeAction?.onDeny,
						},
					}
				: s._actions,
		}));
		return newItem;
	},
	dismiss: (id) =>
		set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })),
	clearAll: () => set({ notifications: [] }),
	markRead: (id) =>
		set((s) => ({
			notifications: s.notifications.map((n) =>
				n.id === id ? { ...n, unread: false } : n,
			),
		})),
	markAllRead: () =>
		set((s) => ({
			notifications: s.notifications.map((n) => ({ ...n, unread: false })),
		})),
	hasUnread: () => get().notifications.some((n) => n.unread),
	approve: (id) => {
		const notif = get().notifications.find((n) => n.id === id);
		const action = notif?.actionId ? get()._actions[notif.actionId] : undefined;
		if (action?.onApprove) {
			try {
				action.onApprove();
			} catch {}
		}
		set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
	},
	deny: (id) => {
		const notif = get().notifications.find((n) => n.id === id);
		const action = notif?.actionId ? get()._actions[notif.actionId] : undefined;
		if (action?.onDeny) {
			try {
				action.onDeny();
			} catch {}
		}
		set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
	},
}));
