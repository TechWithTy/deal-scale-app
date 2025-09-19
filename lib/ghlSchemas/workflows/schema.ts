import { z } from "zod";

const WorkflowSchema = z.object({
	id: z.string(),
	name: z.string(),
	status: z.string(),
	version: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
	locationId: z.string(),
});
export const WorkflowsResponseSchema = z.array(WorkflowSchema);

// API typically returns an object with a `workflows` array
export const WorkflowsListResponseSchema = z.object({
	workflows: z.array(WorkflowSchema),
});

export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowsListResponse = z.infer<typeof WorkflowsListResponseSchema>;

export const WorkflowQuerySchema = z.object({
	locationId: z.string(),
});
