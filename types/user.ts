export interface User {
	id: string;
	name: string;
	email: string;
	password?: string; // Password should be optional as it's sensitive
	role: "admin" | "user";
	permissions: string[];
}
