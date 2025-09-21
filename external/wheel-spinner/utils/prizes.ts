import type { Prize } from "../types";

export const defaultColors = [
	"#EE4040",
	"#F0CF50",
	"#815CD1",
	"#3DA5E0",
	"#34A24F",
	"#F9AA1F",
	"#EC3F3F",
	"#FF9000",
];

export function expandByWeight(prizes: Prize[]): Prize[] {
	const out: Prize[] = [];
	for (const p of prizes) {
		const w = Math.max(1, p.weight ?? 1);
		for (let i = 0; i < w; i++) out.push(p);
	}
	return out;
}
