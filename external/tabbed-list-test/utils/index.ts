/**
 * Shared utilities for tabbed-list-test domain and state.
 * Keep UI-free and framework-agnostic.
 */
import type { PropertySummary } from "../schemas/types";

export function formatAddress(
	p: Pick<PropertySummary, "addressLine" | "city" | "state" | "zip">,
): string {
	const cityStateZip = [p.city, p.state, p.zip].filter(Boolean).join(", ");
	return [p.addressLine, cityStateZip].filter(Boolean).join(" — ");
}

export function toCurrency(
	n?: number,
	locale: string = "en-US",
	currency: string = "USD",
): string {
	if (typeof n !== "number") return "—";
	try {
		return new Intl.NumberFormat(locale, {
			style: "currency",
			currency,
			maximumFractionDigits: 0,
		}).format(n);
	} catch {
		return `$${Math.round(n).toLocaleString()}`;
	}
}

export function safeNumber(val: unknown, fallback = 0): number {
	const n = typeof val === "string" ? Number(val) : (val as number);
	return Number.isFinite(n) ? (n as number) : fallback;
}

export const isServer = typeof window === "undefined";
