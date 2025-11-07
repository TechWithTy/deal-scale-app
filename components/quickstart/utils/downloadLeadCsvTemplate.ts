import {
	LEAD_CSV_TEMPLATE_EXAMPLE_ROW,
	LEAD_CSV_TEMPLATE_HEADERS,
} from "@/lib/config/leads/csvTemplateConfig";
import {
	type QuickStartGoalId,
	type QuickStartPersonaId,
	getGoalDefinition,
	getPersonaDefinition,
} from "@/lib/config/quickstart/wizardFlows";

export interface DownloadLeadCsvTemplateOptions {
	readonly personaId?: QuickStartPersonaId | null;
	readonly goalId?: QuickStartGoalId | null;
	readonly filenamePrefix?: string;
}

const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;

const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

export const buildLeadCsvTemplateCsv = () => {
	const headerRow = LEAD_CSV_TEMPLATE_HEADERS.map(quote).join(",");
	const exampleRow = LEAD_CSV_TEMPLATE_EXAMPLE_ROW.map(quote).join(",");
	return `${headerRow}\n${exampleRow}\n`;
};

export const buildLeadCsvTemplateFilename = (
	options: DownloadLeadCsvTemplateOptions = {},
) => {
	const segments: string[] = [
		options.filenamePrefix ?? "deal-scale",
		"sample-leads",
	];

	if (options.personaId) {
		const personaTitle = getPersonaDefinition(options.personaId)?.title;
		if (personaTitle) segments.push(slugify(personaTitle));
	}

	if (options.goalId) {
		const goalTitle = getGoalDefinition(options.goalId)?.title;
		if (goalTitle) segments.push(slugify(goalTitle));
	}

	return `${segments.filter(Boolean).join("-")}.csv`;
};

export const downloadLeadCsvTemplate = async (
	options: DownloadLeadCsvTemplateOptions = {},
) => {
	try {
		// Fetch the example CSV file from the public folder
		const response = await fetch("/example_data/ExampleCsv.csv");
		if (!response.ok) {
			throw new Error("Failed to fetch example CSV file");
		}
		const csvContent = await response.text();

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
		const blobUrl = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = blobUrl;
		anchor.download = buildLeadCsvTemplateFilename(options);
		anchor.style.display = "none";

		document.body.appendChild(anchor);
		try {
			anchor.click();
		} finally {
			document.body.removeChild(anchor);
			URL.revokeObjectURL(blobUrl);
		}
	} catch (error) {
		console.error("Failed to download example CSV:", error);
		// Fallback to generated CSV if file fetch fails
		const csvContent = buildLeadCsvTemplateCsv();
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
		const blobUrl = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = blobUrl;
		anchor.download = buildLeadCsvTemplateFilename(options);
		anchor.style.display = "none";

		document.body.appendChild(anchor);
		try {
			anchor.click();
		} finally {
			document.body.removeChild(anchor);
			URL.revokeObjectURL(blobUrl);
		}
	}
};
