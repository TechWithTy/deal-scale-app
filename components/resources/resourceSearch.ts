export type ResourceTabValue =
	| "all"
	| "training-videos"
	| "custom-gpts"
	| "simulations"
	| "mentors";

export const resourceTabs: Array<{
	label: string;
	value: ResourceTabValue;
}> = [
	{ label: "All", value: "all" },
	{ label: "Training Videos", value: "training-videos" },
	{ label: "Custom GPTs", value: "custom-gpts" },
	{ label: "Simulations", value: "simulations" },
	{ label: "Mentors", value: "mentors" },
];

export const normalizeResourceQuery = (query: string) =>
	query.trim().toLowerCase();

export const matchesResourceQuery = (query: string, fields: string[]) => {
	const normalizedQuery = normalizeResourceQuery(query);

	if (!normalizedQuery) {
		return true;
	}

	return fields.some((field) => field.toLowerCase().includes(normalizedQuery));
};
