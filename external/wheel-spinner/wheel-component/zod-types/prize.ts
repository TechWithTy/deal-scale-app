import { z } from "zod";

export const PrizeSchema = z.object({
	id: z.string().min(1),
	label: z.string().min(1),
	color: z.string().optional(),
	weight: z
		.number()
		.int()
		.optional()
		.transform((v) => (v && v > 0 ? v : 1)),
});

export type PrizeInput = z.input<typeof PrizeSchema>;
export type PrizeOutput = z.output<typeof PrizeSchema>;
