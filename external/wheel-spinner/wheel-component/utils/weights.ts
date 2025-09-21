import type { Prize } from "../../types";

export function coerceWeight(n?: number): number {
	return Math.max(1, Number.isFinite(n as number) ? (n as number) : 1);
}

export function expandByWeight(prizes: Prize[]): Prize[] {
	const out: Prize[] = [];
	for (const p of prizes) {
		const w = coerceWeight(p.weight);
		for (let i = 0; i < w; i++) out.push(p);
	}
	return out;
}
