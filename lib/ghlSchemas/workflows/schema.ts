import { z } from 'zod';

const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  locationId: z.string()
});
export const WorkflowsResponseSchema = z.array(WorkflowSchema);

export type Workflow = z.infer<typeof WorkflowSchema>;

export const WorkflowQuerySchema = z.object({
  locationId: z.string()
});
