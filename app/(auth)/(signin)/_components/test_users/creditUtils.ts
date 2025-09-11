export type Credits = { allotted: number; used: number; resetInDays: number };

export const updateCredits = (
	currentCredits: Credits,
	field: keyof Credits,
	value: number,
): Credits => {
	const numValue = Number.isFinite(value) ? Math.max(0, value) : 0;
	const updated = {
		...currentCredits,
		[field]: numValue,
	};

	// Ensure used never exceeds allotted
	if (
		(field === "allotted" && updated.used > updated.allotted) ||
		(field === "used" && updated.used > updated.allotted)
	) {
		updated.used = updated.allotted;
	}

	return updated;
};

export const formatCreditsDisplay = (
	used: number,
	allotted: number,
): string => {
	return `${used} / ${allotted}`;
};
