export const normalizeFormValues = (values: unknown): unknown => {
	if (typeof values !== "object" || values === null) return values;
	if (Array.isArray(values)) return values.map(normalizeFormValues);
	return Object.entries(values).reduce(
		(acc, [key, value]) => {
			acc[key] = value === "" ? undefined : normalizeFormValues(value);
			return acc;
		},
		{} as Record<string, unknown>,
	);
};
