export interface CreditStats {
	available: number;
	purchased: number;
	usagePercentage: number;
	used: number;
}

export interface CreditTransaction {
	amount: number;
	balanceAfter: number;
	createdAt: string;
	creditType: string;
	id: string;
	reason: string;
}

function asRecord(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function asNumber(value: unknown) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function extractCreditStats(payload: unknown): CreditStats {
	const record = asRecord(payload);
	return {
		available: asNumber(record.total_available),
		purchased: asNumber(record.total_purchased),
		usagePercentage: asNumber(record.overall_usage_percentage),
		used: asNumber(record.total_used),
	};
}

export function extractCreditTransactions(
	payload: unknown,
): CreditTransaction[] {
	if (!Array.isArray(payload)) return [];
	return payload.flatMap((value) => {
		const transaction = asRecord(value);
		if (
			typeof transaction.id !== "string" ||
			typeof transaction.created_at !== "string"
		) {
			return [];
		}
		return [
			{
				amount: asNumber(transaction.amount),
				balanceAfter: asNumber(transaction.balance_after),
				createdAt: transaction.created_at,
				creditType:
					typeof transaction.credit_type === "string"
						? transaction.credit_type
						: "credits",
				id: transaction.id,
				reason:
					typeof transaction.reason === "string"
						? transaction.reason
						: "Credit transaction",
			},
		];
	});
}
