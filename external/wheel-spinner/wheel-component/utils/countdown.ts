import type { Cadence } from "../../types";

export function nextEligibleAt(last: string | null, cadence: Cadence): number {
	const base = last ? new Date(last).getTime() : 0;
	const add =
		cadence === "daily" ? 864e5 : cadence === "weekly" ? 7 * 864e5 : 30 * 864e5;
	return base + add;
}

export function formatCountdown(ms: number): string {
	const s = Math.max(0, Math.floor(ms / 1000));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
	return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
