import { z } from "zod";
import { PropertySummary } from "./types";

export const PropertySummarySchema = z.object({
	id: z.string(),
	addressLine: z.string(),
	city: z.string(),
	state: z.string(),
	zip: z.string(),
	price: z.number().optional(),
	beds: z.number().optional(),
	baths: z.number().optional(),
	sqft: z.number().optional(),
	lotSqft: z.number().optional(),
	imageUrl: z.string().optional(),
	badges: z.array(z.string()).optional(),
	aiScore: z.number().optional(),
	createdAt: z.date().or(z.string()).optional(),
}) satisfies z.ZodType<PropertySummary>;

export type PropertySummaryInput = z.input<typeof PropertySummarySchema>;
