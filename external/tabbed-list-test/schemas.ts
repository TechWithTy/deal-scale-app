import { z } from "zod";

/**
 * Zod schemas validate external data entering the domain layer.
 */
export const PropertySummarySchema = z.object({
	id: z.string(),
	addressLine: z.string(),
	city: z.string(),
	state: z.string().length(2).or(z.string().min(2)),
	zip: z.string().min(3),
	price: z.number().optional(),
	beds: z.number().optional(),
	baths: z.number().optional(),
	sqft: z.number().optional(),
	lotSqft: z.number().optional(),
	imageUrl: z.string().url().optional(),
	badges: z
		.array(
			z.object({
				label: z.string(),
				tone: z.enum(["default", "info", "success", "warning"]).optional(),
			}),
		)
		.optional(),
	aiScore: z.number().min(0).max(100).optional(),
	createdAt: z.string().optional(),
});

export const PaginationSchema = z.object({
	page: z.number().int().nonnegative(),
	pageSize: z.number().int().positive(),
	total: z.number().int().nonnegative(),
});

export const SortSpecSchema = z.object({
	field: z.enum(["price", "beds", "baths", "sqft", "createdAt", "aiScore"]),
	direction: z.enum(["asc", "desc"]),
});

export const FilterSpecSchema = z
	.object({
		query: z.string().optional(),
		minPrice: z.number().optional(),
		maxPrice: z.number().optional(),
		beds: z.number().optional(),
		baths: z.number().optional(),
		propertyType: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
	})
	.refine((v) => (v.minPrice ?? 0) <= (v.maxPrice ?? Number.MAX_SAFE_INTEGER), {
		message: "minPrice cannot exceed maxPrice",
		path: ["minPrice"],
	});

export const QueryParamsSchema = z.object({
	page: z.number().int().nonnegative().default(0),
	pageSize: z.number().int().positive().default(24),
	sort: SortSpecSchema.nullable().default(null),
	filters: FilterSpecSchema.default({}),
});

export type PropertySummaryInput = z.infer<typeof PropertySummarySchema>;
