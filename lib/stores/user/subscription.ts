import { create } from "zustand";
import type { UserProfileSubscription } from "@/types/userProfile/subscriptions";
import { useUserProfileStore } from "./userProfile";

interface Remaining {
  ai: number;
  leads: number;
  skipTraces: number;
}

interface ResetInDays {
  ai: number;
  leads: number;
  skipTraces: number;
}

interface SubscriptionState {
  get: () => UserProfileSubscription | null;
  planName: () => string;
  status: () => UserProfileSubscription["status"] | "unknown";
  renewalDate: () => string | null;
  resetInDays: () => ResetInDays;
  remaining: () => Remaining;
}

export const useUserSubscriptionStore = create<SubscriptionState>(() => ({
  get: () => useUserProfileStore.getState().userProfile?.subscription ?? null,

  planName: () => useUserProfileStore.getState().userProfile?.subscription?.name ?? "",

  status: () => useUserProfileStore.getState().userProfile?.subscription?.status ?? "unknown",

  renewalDate: () => useUserProfileStore.getState().userProfile?.subscription?.renewalDate ?? null,

  resetInDays: () => {
    const sub = useUserProfileStore.getState().userProfile?.subscription;
    return {
      ai: sub?.aiCredits?.resetInDays ?? 0,
      leads: sub?.leads?.resetInDays ?? 0,
      skipTraces: sub?.skipTraces?.resetInDays ?? 0,
    };
  },

  remaining: () => {
    const sub = useUserProfileStore.getState().userProfile?.subscription;
    const aiAllotted = sub?.aiCredits?.allotted ?? 0;
    const aiUsed = sub?.aiCredits?.used ?? 0;
    const leadsAllotted = sub?.leads?.allotted ?? 0;
    const leadsUsed = sub?.leads?.used ?? 0;
    const stAllotted = sub?.skipTraces?.allotted ?? 0;
    const stUsed = sub?.skipTraces?.used ?? 0;
    return {
      ai: Math.max(0, aiAllotted - aiUsed),
      leads: Math.max(0, leadsAllotted - leadsUsed),
      skipTraces: Math.max(0, stAllotted - stUsed),
    };
  },
}));