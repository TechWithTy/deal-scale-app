import { create } from "zustand";

export type AppNotification = {
	id: string;
	title: string;
	description?: string;
	icon?: string;
	colorHsl?: string; // hsl triplet to tint icon/border
	createdAt: number;
};

type NotificationsState = {
	notifications: AppNotification[];
	add: (n: Omit<AppNotification, "id" | "createdAt">) => AppNotification;
	dismiss: (id: string) => void;
	clearAll: () => void;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
	notifications: [],
	add: (n) => {
		const newItem: AppNotification = {
			...n,
			id: crypto.randomUUID(),
			createdAt: Date.now(),
		};
		set((s) => ({ notifications: [newItem, ...s.notifications] }));
		return newItem;
	},
	dismiss: (id) =>
		set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })),
	clearAll: () => set({ notifications: [] }),
}));
