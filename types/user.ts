export interface User {
	id: string;
	name: string;
	email: string;
	password?: string; // Password should be optional as it's sensitive
	role: "admin" | "user";
	permissions: string[];
	subscription: {
		aiCredits: { allotted: number; used: number; resetInDays: number };
		leads: { allotted: number; used: number; resetInDays: number };
		skipTraces: { allotted: number; used: number; resetInDays: number };
	};
}
