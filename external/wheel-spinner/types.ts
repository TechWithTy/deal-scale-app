export type Cadence = "hourly" | "daily" | "weekly" | "monthly";

export interface Prize {
	id: string;
	label: string;
	weight?: number; // defaults to 1
	color?: string; // optional slice color
	icon?: string; // optional emoji or short text icon (e.g., "🎁")
}

export interface SpinResult {
	prizeId: string;
	label: string;
	at: string; // ISO date string
}

export interface PersistenceHooks {
	getLastSpinAt: (userId: string, cadence: Cadence) => Promise<string | null>;
	setSpinResult: (
		userId: string,
		cadence: Cadence,
		result: SpinResult,
	) => Promise<void>;
}
