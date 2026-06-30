export interface CreditPricingTier {
	name: string;
	credits: number;
	price: number;
	discount: number;
	pricePerCredit: number;
	savings: number;
}

export interface CreditTypeOption {
	display: string;
	value: string;
}

export interface CreditPricingCatalog {
	currency: string;
	creditTypes: CreditTypeOption[];
	tiers: CreditPricingTier[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function numberOrZero(value: unknown) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function extractCreditPricingCatalog(
	payload: unknown,
): CreditPricingCatalog {
	if (!isRecord(payload)) {
		return { currency: "USD", creditTypes: [], tiers: [] };
	}

	const tiers = Array.isArray(payload.tiers)
		? payload.tiers.flatMap((candidate) => {
				if (!isRecord(candidate)) return [];
				const credits = numberOrZero(candidate.credits);
				const price = numberOrZero(candidate.price);
				if (credits <= 0 || price < 0) return [];
				return [
					{
						name:
							typeof candidate.name === "string"
								? candidate.name
								: `${credits.toLocaleString()} Credits`,
						credits,
						price,
						discount: numberOrZero(candidate.discount),
						pricePerCredit: numberOrZero(candidate.price_per_credit),
						savings: numberOrZero(candidate.savings),
					},
				];
			})
		: [];

	const creditTypes = Array.isArray(payload.available_credit_types)
		? payload.available_credit_types.flatMap((candidate) => {
				if (
					!isRecord(candidate) ||
					typeof candidate.value !== "string" ||
					!candidate.value ||
					typeof candidate.display !== "string" ||
					!candidate.display
				) {
					return [];
				}
				return [{ value: candidate.value, display: candidate.display }];
			})
		: [];

	return {
		currency:
			typeof payload.currency === "string"
				? payload.currency.toUpperCase()
				: "USD",
		creditTypes,
		tiers,
	};
}

export function extractCheckoutUrl(payload: unknown): string | null {
	if (!isRecord(payload)) return null;
	const candidate =
		typeof payload.session_url === "string"
			? payload.session_url
			: typeof payload.url === "string"
				? payload.url
				: null;
	if (!candidate) return null;

	try {
		const url = new URL(candidate);
		return url.protocol === "https:" ? url.toString() : null;
	} catch {
		return null;
	}
}
