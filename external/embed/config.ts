import { z } from "zod";

const advancedConfigSchema = z
	.object({
		legend: z.enum(["none", "top", "bottom"]).optional(),
		animation: z.boolean().optional(),
		comparisonSeries: z.array(z.string()).optional(),
	})
	.default({});

const hostConfigSchema = z.object({
	chartId: z.string().min(1),
	chartType: z.enum(["bar", "area", "pie"]),
	refreshInterval: z.coerce.number().optional(),
	authToken: z.string().optional(),
	theme: z.enum(["light", "dark"]).optional(),
	timezone: z.string().optional(),
	endpoint: z.string().url().optional(),
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

export type HostEmbedConfig = {
	chartId: string;
	chartType: "bar" | "area" | "pie";
	refreshInterval?: number;
	authToken?: string;
	theme: "light" | "dark";
	timezone?: string;
	advancedConfig: z.infer<typeof advancedConfigSchema>;
	endpoint?: string;
};

export function parseHostElement(element: Element): HostEmbedConfig {
	const raw = {
		chartId: element.getAttribute("data-chart-id") ?? undefined,
		chartType: element.getAttribute("data-chart-type") ?? undefined,
		refreshInterval: element.getAttribute("data-refresh-interval") ?? undefined,
		authToken: element.getAttribute("data-auth-token") ?? undefined,
		theme: element.getAttribute("data-theme") ?? undefined,
		timezone: element.getAttribute("data-timezone") ?? undefined,
		config: element.getAttribute("data-config") ?? undefined,
		endpoint: element.getAttribute("data-endpoint") ?? undefined,
	};

	const parsed = hostConfigSchema.safeParse(raw);
	if (!parsed.success) {
		throw parsed.error;
}

	const advanced = advancedConfigSchema.parse(parsed.data.config ?? {});

	return {
		chartId: parsed.data.chartId,
		chartType: parsed.data.chartType,
		refreshInterval: parsed.data.refreshInterval,
		authToken: parsed.data.authToken,
		theme: parsed.data.theme ?? "light",
		timezone: parsed.data.timezone,
		advancedConfig: advanced,
		endpoint: parsed.data.endpoint,
	};
}

