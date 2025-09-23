/**
 * Minimal utilities local to the external package to avoid alias imports.
 */

export function cn(
	...classes: Array<string | false | null | undefined>
): string {
	return classes.filter(Boolean).join(" ");
}

/**
 * Format a delta number with +/-, returning the value and a color class.
 */
export function formatDelta(
	delta?: number,
): { text: string; color: string } | null {
	if (typeof delta !== "number" || Number.isNaN(delta)) return null;
	const sign = delta > 0 ? "+" : "";
	const color =
		delta > 0
			? "text-emerald-500"
			: delta < 0
				? "text-red-500"
				: "text-muted-foreground";
	return { text: `${sign}${delta}`, color };
}
