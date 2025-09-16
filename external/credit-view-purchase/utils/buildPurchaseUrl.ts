export type CreditKind = "ai" | "leads" | "skip-traces";

/**
 * Build a URL to the credit purchase flow with kind and amount pre-selected.
 * If `baseUrl` is provided, returns an absolute HTTPS URL; otherwise returns a relative path.
 * Example: https://buy.dealscale.io/purchase/credits?kind=ai&amount=250
 */
export function buildPurchaseUrl(
	kind: CreditKind,
	amount: number,
	baseUrl?: string,
) {
	const safeAmount =
		Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
	const params = new URLSearchParams({ kind, amount: String(safeAmount) });
	const path = `/purchase/credits?${params.toString()}`;
	if (baseUrl) {
		const trimmed = baseUrl.replace(/\/$/, "");
		return `${trimmed}${path}`;
	}
	return path;
}
