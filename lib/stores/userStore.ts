import type {
	PermissionAction,
	PermissionMatrix,
	PermissionResource,
	UserQuotas,
	UserRole,
	UserTier,
} from "@/types/user";
import { create } from "zustand";

interface UserCredits {
	used: number;
	allotted: number;
}

type QuotaKey = keyof UserQuotas;

const DEFAULT_MATRIX: PermissionMatrix = {};

function matrixFromList(list: string[] | undefined): PermissionMatrix {
	if (!list || list.length === 0) return {} as PermissionMatrix;
	const matrix: PermissionMatrix = {};
	for (const entry of list) {
		const [resource, action] = entry.split(":");
		if (!resource || !action) continue;
		const r = resource.trim() as PermissionResource;
		const a = action.trim() as PermissionAction;
		const arr = matrix[r] ?? [];
		if (!arr.includes(a)) {
			arr.push(a);
			matrix[r] = arr;
		}
	}
	return matrix;
}

const zeroQuota = (): UserQuotas => ({
	ai: { allotted: 0, used: 0, resetInDays: 0 },
	leads: { allotted: 0, used: 0, resetInDays: 0 },
	skipTraces: { allotted: 0, used: 0, resetInDays: 0 },
});

interface UserState {
	role?: UserRole;
	tier?: UserTier;
	permissionList: string[];
	permissionMatrix: PermissionMatrix;
	quotas: UserQuotas;
	credits: {
		ai: UserCredits;
		leads: UserCredits;
		skipTraces: UserCredits;
	};
	isBetaTester: boolean;
	isPilotTester: boolean;
	setUser: (
		session: {
			user?: {
				role?: UserRole;
				tier?: UserTier;
				permissions?: string[];
				permissionMatrix?: PermissionMatrix;
				permissionList?: string[];
				quotas?: UserQuotas;
				subscription?: {
					aiCredits?: UserCredits;
					leads?: UserCredits;
					skipTraces?: UserCredits;
				};
				isBetaTester?: boolean;
				isPilotTester?: boolean;
			};
		} | null,
	) => void;
	consumeLeads: (amount: number) => void;
	consumeAI: (amount: number) => void;
	hasPermission: (
		resource: PermissionResource,
		action: PermissionAction,
	) => boolean;
	hasQuota: (key: QuotaKey, amount?: number) => boolean;
}

const createBaseState = () => ({
	role: undefined as UserRole | undefined,
	tier: undefined as UserTier | undefined,
	permissionList: [] as string[],
	permissionMatrix: {} as PermissionMatrix,
	quotas: zeroQuota(),
	credits: {
		ai: { used: 0, allotted: 0 },
		leads: { used: 0, allotted: 0 },
		skipTraces: { used: 0, allotted: 0 },
	},
	isBetaTester: false,
	isPilotTester: false,
});

export const useUserStore = create<UserState>((set, get) => ({
	...createBaseState(),
	setUser: (session) => {
		if (!session?.user) {
			set({ ...createBaseState() });
			return;
		}

		const u = session.user;
		const permissionList = u.permissionList || u.permissions || [];
		const baseState = createBaseState();
		const permissionMatrix =
			u.permissionMatrix && Object.keys(u.permissionMatrix).length
				? u.permissionMatrix
				: matrixFromList(permissionList);
		const quotas = u.quotas ?? {
			ai: {
				allotted: u.subscription?.aiCredits?.allotted || 0,
				used: u.subscription?.aiCredits?.used || 0,
			},
			leads: {
				allotted: u.subscription?.leads?.allotted || 0,
				used: u.subscription?.leads?.used || 0,
			},
			skipTraces: {
				allotted: u.subscription?.skipTraces?.allotted || 0,
				used: u.subscription?.skipTraces?.used || 0,
			},
		};

		set({
			...baseState,
			role: u.role,
			tier: u.tier,
			permissionList,
			permissionMatrix,
			quotas,
			credits: {
				ai: {
					used: quotas.ai.used ?? 0,
					allotted: quotas.ai.allotted ?? 0,
				},
				leads: {
					used: quotas.leads.used ?? 0,
					allotted: quotas.leads.allotted ?? 0,
				},
				skipTraces: {
					used: quotas.skipTraces.used ?? 0,
					allotted: quotas.skipTraces.allotted ?? 0,
				},
			},
			isBetaTester: Boolean(u.isBetaTester),
			isPilotTester: Boolean(u.isPilotTester),
		});
	},
	consumeLeads: (amount) => {
		const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
		if (safeAmount === 0) return;
		set((state) => {
			const current = state.credits.leads;
			const remaining = Math.max(0, current.allotted - current.used);
			const delta = Math.min(remaining, safeAmount);
			const newUsed = Math.min(current.allotted, current.used + delta);
			return {
				credits: {
					...state.credits,
					leads: { ...current, used: newUsed },
				},
				quotas: {
					...state.quotas,
					leads: { ...state.quotas.leads, used: newUsed },
				},
			};
		});
	},
	consumeAI: (amount) => {
		const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
		if (safeAmount === 0) return;
		set((state) => {
			const current = state.credits.ai;
			const remaining = Math.max(0, current.allotted - current.used);
			const delta = Math.min(remaining, safeAmount);
			const newUsed = Math.min(current.allotted, current.used + delta);
			return {
				credits: {
					...state.credits,
					ai: { ...current, used: newUsed },
				},
				quotas: {
					...state.quotas,
					ai: { ...state.quotas.ai, used: newUsed },
				},
			};
		});
	},
	hasPermission: (resource, action) => {
		const matrix = get().permissionMatrix;
		const actions = matrix[resource];
		if (!actions || actions.length === 0) return false;
		return actions.includes(action);
	},
	hasQuota: (key, amount = 1) => {
		const bucket = get().quotas[key];
		if (!bucket) return false;
		const remaining = Math.max(0, (bucket.allotted ?? 0) - (bucket.used ?? 0));
		return remaining >= amount;
	},
}));

export const useRemainingLeads = () =>
	useUserStore((state) => {
		const current = state.credits.leads;
		return Math.max(0, current.allotted - current.used);
	});

export const useRemainingAI = () =>
	useUserStore((state) => {
		const current = state.credits.ai;
		return Math.max(0, current.allotted - current.used);
	});
