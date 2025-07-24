import { z } from "zod";

export const CreateOpportunitySchema = z.object({
	pipelineId: z.string({ description: "ID of the pipeline" }).min(1),
	locationId: z.string({ description: "ID of the location" }).min(1),
	name: z.string({ description: "Name of the opportunity" }).min(1),
	pipelineStageId: z.string().optional().describe("ID of the pipeline stage"),
	status: z.enum(["open", "won", "lost", "abandoned", "all"], {
		description: "Status of the opportunity",
	}),
	contactId: z.string({ description: "ID of the contact" }).min(1),
	monetaryValue: z.number().optional().describe("Monetary value"),
	assignedTo: z.string().optional().describe("ID of the entity assigned to"),
	customFields: z
		.array(
			z.object({
				id: z.string().optional().describe("ID of the custom field"),
				key: z.string().optional().describe("Key of the custom field"),
				field_value: z.string().describe("Value of the custom field"),
			}),
		)
		.optional()
		.describe("Custom fields"),
});

export const SearchOpportunitiesQuerySchema = z.object({
	assigned_to: z.string().optional(),
	campaignId: z.string().optional(),
	contact_id: z.string().optional(),
	country: z.string().optional(),
	date: z.string().optional(), // Consider using a date format validation here
	endDate: z.string().optional(), // Consider using a date format validation here
	getCalendarEvents: z.boolean().optional(),
	getNotes: z.boolean().optional(),
	getTasks: z.boolean().optional(),
	id: z.string().optional(),
	limit: z.number().min(1).max(100).default(20).optional(),
	order: z.string().optional(),
	page: z.number().min(1).default(1).optional(),
	pipeline_id: z.string().optional(),
	pipeline_stage_id: z.string().optional(),
	q: z.string().optional(),
	startAfter: z.string().optional(), // Consider using a date format validation here
	startAfterId: z.string().optional(),
	status: z.enum(["open", "won", "lost", "abandoned", "all"]).optional(),
	location_id: z.string().min(1), // Required field
});
// Type based on the schema
export type CreateOpportunity = z.infer<typeof CreateOpportunitySchema>;
export type SearchOpportunitiesQuery = z.infer<
	typeof SearchOpportunitiesQuerySchema
>;
