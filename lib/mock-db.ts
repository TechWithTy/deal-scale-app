import type { User } from "../types/user";

export const users: User[] = [
	{
		id: "1",
		name: "Admin User",
		email: "admin@example.com",
		password: "password123",
		role: "admin",
		// Deprecated: per-user permissions are managed via global CRUD state; keep empty to avoid duplication
		permissions: [],
		subscription: {
			aiCredits: { allotted: 1000, used: 250, resetInDays: 7 },
			leads: { allotted: 500, used: 120, resetInDays: 30 },
			skipTraces: { allotted: 200, used: 50, resetInDays: 30 },
		},
	},
];

export const getUserByEmail = (email: string): User | undefined => {
	return users.find((user) => user.email === email);
};
