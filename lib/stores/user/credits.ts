import { produce } from "immer";
import { create } from "zustand";
import { withAnalytics } from "../_middleware/analytics";
import { useUserProfileStore } from "./userProfile";

type CreditKey = "aiCredits" | "leads" | "skipTraces";
type Kind = "ai" | "leads" | "skipTraces";

interface Remaining {
	ai: number;
	leads: number;
	skipTraces: number;
}

interface CreditsStoreState {
	remaining: () => Remaining;
	consume: (kind: Kind, amount: number) => boolean; // returns success
	refund: (kind: Kind, amount: number) => void;
}

function keyOf(kind: Kind): CreditKey {
	switch (kind) {
		case "ai":
			return "aiCredits";
		case "leads":
			return "leads";
		case "skipTraces":
			return "skipTraces";
	}
}

export const useUserCreditsStore = create<CreditsStoreState>(
	withAnalytics<CreditsStoreState>("user_credits", () => ({
		remaining: () => {
			const sub = useUserProfileStore.getState().userProfile?.subscription;
			const ai = sub?.aiCredits ?? { allotted: 0, used: 0 };
			const leads = sub?.leads ?? { allotted: 0, used: 0 };
			const st = sub?.skipTraces ?? { allotted: 0, used: 0 };
			return {
				ai: Math.max(0, (ai.allotted ?? 0) - (ai.used ?? 0)),
				leads: Math.max(0, (leads.allotted ?? 0) - (leads.used ?? 0)),
				skipTraces: Math.max(0, (st.allotted ?? 0) - (st.used ?? 0)),
			};
		},

		consume: (kind, amount) => {
			const amt = Number.isFinite(amount) && amount > 0 ? amount : 0;
			if (amt === 0) return false;
			const sub = useUserProfileStore.getState().userProfile?.subscription;
			if (!sub) return false;
			const key = keyOf(kind);
			const bucket = (
				sub as Record<CreditKey, { allotted?: number; used?: number }>
			)[key];
			const remaining = Math.max(
				0,
				(bucket?.allotted ?? 0) - (bucket?.used ?? 0),
			);
			const delta = Math.min(remaining, amt);
			if (delta === 0) return false;
			useUserProfileStore.setState(
				produce((state) => {
					const s = state.userProfile?.subscription as
						| Record<CreditKey, { allotted?: number; used?: number }>
						| undefined;
					if (!s) return;
					const b = s[key] ?? { allotted: 0, used: 0 };
					b.used = Math.min(b.allotted ?? 0, (b.used ?? 0) + delta);
					s[key] = b;
				}),
			);
			return true;
		},

		refund: (kind, amount) => {
			const amt = Number.isFinite(amount) && amount > 0 ? amount : 0;
			if (amt === 0) return;
			useUserProfileStore.setState(
				produce((state) => {
					const sub = state.userProfile?.subscription as
						| Record<CreditKey, { allotted?: number; used?: number }>
						| undefined;
					if (!sub) return;
					const key = keyOf(kind);
					const b = sub[key] ?? { allotted: 0, used: 0 };
					b.used = Math.max(0, (b.used ?? 0) - amt);
					sub[key] = b;
				}),
			);
		},
	})),
);
