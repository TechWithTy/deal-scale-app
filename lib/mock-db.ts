import type { User } from "../types/user";

export const users: User[] = [
	{
		id: "1",
		name: "Admin User",
		email: "admin@example.com",
		password: "password123",
		role: "admin",
		permissions: ["users:create", "users:read", "users:update", "users:delete"],
	},
	{
		id: "2",
		name: "Regular User",
		email: "user@example.com",
		password: "password123",
		role: "user",
		permissions: ["users:read"],
	},
];

export const getUserByEmail = (email: string): User | undefined => {
	return users.find((user) => user.email === email);
};
