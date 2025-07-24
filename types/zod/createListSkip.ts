import { z } from "zod";

export const skipTraceSchema = z
	.object({
		newListName: z
			.string()
			.min(1, { message: "List name is required" })
			.max(50, { message: "List name cannot exceed 50 characters" }), // Limits the new list name to 50 characters
		recordsToSkip: z.number(), // No minimum, validation will be handled in superRefine
		redoSkipTrace: z.boolean(),
		totalLeads: z
			.number()
			.min(1, { message: "There must be at least 1 lead." }), // Ensures at least 1 lead is available
	})
	.superRefine(({ recordsToSkip, totalLeads }, ctx) => {
		// Validate recordsToSkip must be greater than or equal to 0
		if (recordsToSkip < 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Records to skip cannot be negative.",
				path: ["recordsToSkip"],
			});
		}

		// Ensure recordsToSkip does not exceed totalLeads
		if (recordsToSkip > totalLeads) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Cannot skip more leads than available.",
				path: ["recordsToSkip"], // Attach the error to the `recordsToSkip` field
			});
		}
	});
