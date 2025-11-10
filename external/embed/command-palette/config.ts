import { z } from "zod";

const booleanAttr = z.preprocess((value) => {
	if (typeof value !== "string") return value;
	const normalized = value.trim().toLowerCase();
	if (["true", "1", "yes", "on"].includes(normalized)) return true;
	if (["false", "0", "no", "off"].includes(normalized)) return false;
	return value;
}, z.boolean().optional());

const endpointSchema = z
	.string()
	.trim()
	.refine((value) => value.length > 0, { message: "Endpoint cannot be empty" })
	.refine(
		(value) => {
			try {
				// Allow relative URLs
				if (value.startsWith("/")) return true;
				new URL(value);
				return true;
			} catch {
				return false;
			}
		},
		{ message: "Endpoint must be a relative path or absolute URL" },
	);

const advancedConfigSchema = z
	.object({
		title: z.string().optional(),
		description: z.string().optional(),
		buttonLabel: z.string().optional(),
		keyboardHint: z.string().optional(),
	})
	.default({});

const hostConfigSchema = z.object({
	variant: z.enum(["dialog", "floating"]).optional(),
	keyboard: booleanAttr,
	initialQuery: z.string().optional(),
	aiSuggestEndpoint: endpointSchema.optional(),
	token: z.string().optional(),
	openOnSelect: booleanAttr,
	selectContainer: z.string().optional(),
	config: z
		.string()
		.transform((value, ctx) => {
			try {
				return JSON.parse(value) as unknown;
			} catch (error) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Invalid JSON in data-config",
				});
				return z.NEVER;
			}
		})
		.optional(),
});

export type CommandPaletteEmbedConfig = {
	variant: "dialog" | "floating";
	keyboard: boolean;
	initialQuery: string;
	aiSuggestEndpoint: string;
	token?: string;
	openOnSelect: boolean;
	selectContainer?: string;
	advancedConfig: z.infer<typeof advancedConfigSchema>;
};

export function parseCommandPaletteHost(
	element: Element,
): CommandPaletteEmbedConfig {
	const raw = {
		variant: element.getAttribute("data-variant") ?? undefined,
		keyboard: element.getAttribute("data-keyboard") ?? undefined,
		initialQuery: element.getAttribute("data-initial-query") ?? undefined,
		aiSuggestEndpoint:
			element.getAttribute("data-ai-suggest-endpoint") ?? undefined,
		token: element.getAttribute("data-token") ?? undefined,
		openOnSelect: element.getAttribute("data-open-on-select") ?? undefined,
		selectContainer: element.getAttribute("data-select-container") ?? undefined,
		config: element.getAttribute("data-config") ?? undefined,
	};

	const parsed = hostConfigSchema.safeParse(raw);
	if (!parsed.success) {
		throw parsed.error;
	}

	const advanced = advancedConfigSchema.parse(parsed.data.config ?? {});

	return {
		variant: parsed.data.variant ?? "dialog",
		keyboard: parsed.data.keyboard ?? true,
		initialQuery: parsed.data.initialQuery ?? "",
		aiSuggestEndpoint:
			parsed.data.aiSuggestEndpoint ?? "/api/ai/command-suggest",
		token: parsed.data.token,
		openOnSelect: parsed.data.openOnSelect ?? false,
		selectContainer: parsed.data.selectContainer,
		advancedConfig: advanced,
	};
}
