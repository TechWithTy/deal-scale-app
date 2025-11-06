import { create } from "zustand";

export type FormFieldType =
	| "text"
	| "number"
	| "file"
	| "password"
	| "email"
	| "date"
	| "datetime";

export type NotificationFormField = {
	id: string;
	label: string;
	type: FormFieldType;
	placeholder?: string;
	required?: boolean;
	// Text/password/email validation
	minLength?: number;
	maxLength?: number;
	regex?: string; // regex pattern as string
	regexMessage?: string;
	// Number validation
	min?: number;
	max?: number;
	// File validation
	acceptedFileTypes?: string[]; // e.g. ["image/png", "image/jpeg"]
	maxFileSizeMB?: number;
	// Image-specific validation
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
	// Date validation
	minDate?: string; // ISO date string
	maxDate?: string; // ISO date string
	sensitive?: boolean; // marks field as sensitive (masked input)
};

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
	formFields?: NotificationFormField[];
	submitLabel?: string;
};

type NotificationsState = {
	notifications: AppNotification[];
	add: (n: Omit<AppNotification, "id" | "createdAt">) => AppNotification;
	addMany: (count?: number) => void;
	dismiss: (id: string) => void;
	clearAll: () => void;
	markRead: (id: string) => void;
	markAllRead: () => void;
	hasUnread: () => boolean;
	// action handlers keyed by actionId
	_actions: Record<
		string,
		{
			onApprove?: () => void;
			onDeny?: () => void;
			onSubmit?: (data: Record<string, string | number | File>) => void;
		}
	>;
	approve: (id: string) => void;
	deny: (id: string) => void;
	submitForm: (
		id: string,
		data: Record<string, string | number | File>,
	) => void;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
	notifications: [],
	_actions: {},
	addMany: (count = 5) => {
		const icons = ["✨", "📥", "🔔", "📧", "📈", "⚙️", "🛠️", "🚀"];
		const colors = [
			"46 100% 50%",
			"200 85% 45%",
			"142 76% 36%",
			"258 84% 54%",
			"24 95% 50%",
		];
		const created: AppNotification[] = [];
		for (let i = 0; i < count; i += 1) {
			const icon = icons[i % icons.length];
			const colorHsl = colors[i % colors.length];
			const base: AppNotification = {
				id: crypto.randomUUID(),
				title: `Mock notification #${i + 1}`,
				description: "This is a test notification.",
				icon,
				colorHsl,
				createdAt: Date.now() + i,
				unread: true,
			};
			created.push(base);
		}
		set((s) => ({ notifications: [...created, ...s.notifications] }));
	},
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
	submitForm: (id, data) => {
		const notif = get().notifications.find((n) => n.id === id);
		const action = notif?.actionId ? get()._actions[notif.actionId] : undefined;
		if (action?.onSubmit) {
			try {
				action.onSubmit(data);
			} catch {}
		}
		set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
	},
}));
