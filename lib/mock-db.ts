import type { User } from "../types/user";

export const users: User[] = [
	{
		id: "1",
		name: "Admin User",
		email: "admin@example.com",
		password: "password123",
		role: "admin",
		permissions: ["users:create", "users:read", "users:update", "users:delete"],
		subscription: {
			aiCredits: { allotted: 1000, used: 250, resetInDays: 7 },
			leads: { allotted: 500, used: 120, resetInDays: 30 },
			skipTraces: { allotted: 200, used: 50, resetInDays: 30 },
		},
	},
	{
		id: "2",
		name: "Regular User",
		email: "user@example.com",
		password: "password123",
		role: "user",
		permissions: ["users:read"],
		subscription: {
			aiCredits: { allotted: 500, used: 450, resetInDays: 7 },
			leads: { allotted: 100, used: 90, resetInDays: 30 },
			skipTraces: { allotted: 50, used: 40, resetInDays: 30 },
		},
	},
];

export const getUserByEmail = (email: string): User | undefined => {
	return users.find((user) => user.email === email);
};
