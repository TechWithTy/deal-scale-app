import type { Cadence } from "../types";

export function startOfNextDay(d: Date) {
	const x = new Date(d);
	x.setHours(24, 0, 0, 0);
	return x;
}

export function startOfNextWeek(d: Date) {
	const x = new Date(d);
	const day = x.getDay();
	const daysUntilMonday = (8 - day) % 7 || 7;
	x.setDate(x.getDate() + daysUntilMonday);
	x.setHours(0, 0, 0, 0);
	return x;
}

export function startOfNextMonth(d: Date) {
	const x = new Date(d.getFullYear(), d.getMonth() + 1, 1);
	x.setHours(0, 0, 0, 0);
	return x;
}

export function getNextEligibility(from: Date, cadence: Cadence): Date {
	if (cadence === "daily") return startOfNextDay(from);
	if (cadence === "weekly") return startOfNextWeek(from);
	return startOfNextMonth(from);
}

export function formatCountdown(ms: number): string {
	if (ms <= 0) return "00:00:00";
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
