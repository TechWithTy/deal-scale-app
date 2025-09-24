import { create } from "zustand";
import type { UserPermissions } from "@/types/userProfile";
import { useSessionStore } from "./useSessionStore";
import { useUserProfileStore } from "./userProfile";
import { useUserStore } from "@/lib/stores/userStore";

type PermissionKey = keyof UserPermissions;

function currentPermissions(): Partial<UserPermissions> | null {
  const sessionUser = useSessionStore.getState().user;
  const email = sessionUser?.email;
  if (!email) return null;
  const members = useUserProfileStore.getState().userProfile?.teamMembers ?? [];
  const me = members.find((m) => m.email === email);
  return me?.permissions ?? null;
}

interface PermissionsStoreState {
  hasPermission: <K extends PermissionKey>(k: K) => boolean;
  // Convenience helpers
  canManageTeam: () => boolean;
  canAccessAI: () => boolean;
  canManageSubscription: () => boolean;
}

function hasPermissionImpl<K extends PermissionKey>(k: K): boolean {
  const perms = currentPermissions();
  if (perms && typeof perms[k] === "boolean") return Boolean(perms[k]);
  const strings = useUserStore.getState().permissions ?? [];
  return strings.includes(String(k));
}

export const usePermissionsStore = create<PermissionsStoreState>(() => ({
  hasPermission: (k) => hasPermissionImpl(k),
  canManageTeam: () => hasPermissionImpl("canManageTeam"),
  canAccessAI: () => hasPermissionImpl("canAccessAI"),
  canManageSubscription: () => hasPermissionImpl("canManageSubscription"),
}));
