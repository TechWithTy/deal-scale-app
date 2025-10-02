"use client";

import { toast } from "sonner";
import { signIn } from "next-auth/react";
import type { User as UserType } from "@/types/user";

// Extend the User type to ensure password is required for test users
export type TestUser = Omit<UserType, "password"> & {
	password: string; // Make password required for test users
};

export type Credits = { allotted: number; used: number; resetInDays: number };

export type EditableUser = TestUser & {
	aiCredits: Credits;
	leadsCredits: Credits;
	skipTracesCredits: Credits;
	newPermission?: string;
};

export const handleLogin = async (user: EditableUser) => {
	try {
		await signIn("credentials", {
			email: user.email,
			password: user.password,
			// propagate current UI selections into credentials for authorize()
			role: user.role,
			permissions: JSON.stringify(user.permissions),
			aiAllotted: String(user.aiCredits.allotted),
			aiUsed: String(user.aiCredits.used),
			leadsAllotted: String(user.leadsCredits.allotted),
			leadsUsed: String(user.leadsCredits.used),
			skipAllotted: String(user.skipTracesCredits.allotted),
			skipUsed: String(user.skipTracesCredits.used),
			callbackUrl: "/dashboard",
			redirect: true,
		});
	} catch (error) {
		toast.error("An error occurred during login");
		console.error("Login error:", error);
	}
};

// Quick add common permissions via chips
export const COMMON_PERMISSIONS = [
	"users:create",
	"users:read",
	"users:update",
	"users:delete",
] as const;

export const initializeEditableUsers = (testUsers: TestUser[]) =>
	testUsers.map((u) => ({
		...u,
		aiCredits:
			// Prefer subscription credits if available (UserType includes subscription)
			u.subscription?.aiCredits ??
			(u.role === "admin"
				? { allotted: 1000, used: 250, resetInDays: 7 }
				: { allotted: 500, used: 100, resetInDays: 7 }),
		leadsCredits:
			u.subscription?.leads ??
			(u.role === "admin"
				? { allotted: 500, used: 120, resetInDays: 30 }
				: { allotted: 100, used: 20, resetInDays: 30 }),
		skipTracesCredits:
			u.subscription?.skipTraces ??
			(u.role === "admin"
				? { allotted: 200, used: 50, resetInDays: 30 }
				: { allotted: 50, used: 10, resetInDays: 30 }),
	}));
