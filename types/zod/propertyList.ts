import * as z from "zod";
const locationRegex =
	/^(?:(?:\d{5}(?:-\d{4})?)|(?:[A-Za-z ]+,\s?[A-Za-z]{2})|(?:[A-Za-z ]+),\s?\d{5}(?:-\d{4})?)$/;

export const mapFormSchema = z.object({
	location: z
		.string()
		.min(1, "Location is required")
		.refine((val) => locationRegex.test(val), {
			message:
				"Please enter a valid State, Zip, County, Street, Neighborhood, or Address",
		}),

	marketStatus: z
		.string()
		.max(10, "Market status must be 10 characters or less")
		.optional(),
	beds: z.string().max(3, "Beds must be 3 characters or less").optional(),
	baths: z.string().max(3, "Baths must be 3 characters or less").optional(),
	propertyType: z.string().optional(),
	advanced: z.object({
		radius: z
			.string()
			.refine((val) => /^\d{1,6}(\.\d{1,5})?$/.test(val) && val.length <= 6, {
				message: "Radius must be a number or a decimal up to 6 characters",
			}),
		pastDays: z.string().refine((val) => /^\d{1,5}$/.test(val), {
			message: "Past Days must be a number up to 5 digits",
		}),
		dateFrom: z
			.string()
			.max(10, "Date must be 10 characters or less")
			.optional(),
		dateTo: z.string().max(10, "Date must be 10 characters or less").optional(),
		mlsOnly: z.boolean().optional(),
		foreclosure: z.boolean().optional(),
		proxy: z
			.string()
			.refine(
				(val) => /^(https?:\/\/)[^\s:@]+:[^\s:@]+@[^\s:@]+:\d{2,5}$/.test(val),
				{
					message:
						"Proxy must be in the format 'http://user:pass@host:port' or 'https://user:pass@host:port'",
				},
			),
		extraPropertyData: z.boolean().optional(),
		excludePending: z.boolean().optional(),
		limit: z
			.string()
			.optional()
			.refine((val) => val === undefined || /^\d+$/.test(val), {
				message: "Limit must be a number.",
			})
			.refine(
				(val) =>
					val === undefined ||
					(Number.parseInt(val, 10) >= 1 && Number.parseInt(val, 10) <= 10000),
				{
					message: "Limit must be between 1 and 10,000.",
				},
			),
	}),
});
