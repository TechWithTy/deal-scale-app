import {
	isLikelyAddress,
	isValidUSCity,
	isValidUSState,
	isValidZipCode,
} from "@/lib/utils/locationValidator";
import * as z from "zod";

export const mapFormSchema = z.object({
	location: z
		.string()
		.min(1, "Location is required")
		.refine(
			(val) => {
				const trimmedVal = val.trim();
				return (
					isValidZipCode(trimmedVal) ||
					isValidUSState(trimmedVal) ||
					isValidUSCity(trimmedVal) ||
					isLikelyAddress(trimmedVal)
				);
			},
			{
				message: "Please enter a valid city or zip code",
			},
		),

	marketStatus: z
		.string()
		.max(10, "Market status must be 10 characters or less")
		.optional(),
	persona: z.string().optional(),
	goal: z.string().optional(),
	beds: z.string().max(3, "Beds must be 3 characters or less").optional(),
	baths: z.string().max(3, "Baths must be 3 characters or less").optional(),
	propertyType: z.string().optional(),
	advanced: z.object({
		radius: z
			.string()
			.optional()
			.refine(
				(val) =>
					val === undefined ||
					(/^\d{1,6}(\.\d{1,5})?$/.test(val) && val.length <= 6),
				{
					message: "Radius must be a number or a decimal up to 6 characters",
				},
			),
		pastDays: z
			.string()
			.optional()
			.refine((val) => val === undefined || /^\d{1,5}$/.test(val), {
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
			.optional()
			.refine(
				(val) =>
					val === undefined ||
					/^(https?:\/\/)[^\s:@]+:[^\s:@]+@[^\s:@]+:\d{2,5}$/.test(val),
				{
					message:
						"Proxy must be in the format 'http://user:pass@host:port' or 'https://user:pass@host:port'",
				},
			),
		extraPropertyData: z.boolean().optional(),
		excludePending: z.boolean().optional(),
		ownerOccupiedOnly: z.boolean().optional(),
		hasPool: z.boolean().optional(),
		hasGarage: z.boolean().optional(),
		minEquityPercent: z
			.string()
			.optional()
			.refine(
				(val) =>
					val === undefined ||
					(/^\d{1,3}(\.\d{1,2})?$/.test(val) && Number.parseFloat(val) <= 100),
				{
					message: "Equity % must be between 0 and 100",
				},
			),
		lastSaleWithinYears: z
			.string()
			.optional()
			.refine(
				(val) =>
					val === undefined ||
					(/^\d{1,2}$/.test(val) && Number.parseInt(val, 10) <= 30),
				{
					message: "Years must be 30 or less",
				},
			),
		minAssessedValue: z
			.string()
			.optional()
			.refine((val) => val === undefined || /^\d{3,9}$/.test(val), {
				message: "Min value must be numeric",
			})
			.refine(
				(val) => val === undefined || Number.parseInt(val, 10) <= 10000000,
				{
					message: "Value must be <= 10,000,000",
				},
			),
		maxAssessedValue: z
			.string()
			.optional()
			.refine((val) => val === undefined || /^\d{3,9}$/.test(val), {
				message: "Max value must be numeric",
			})
			.refine(
				(val) => val === undefined || Number.parseInt(val, 10) <= 10000000,
				{
					message: "Value must be <= 10,000,000",
				},
			),
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
