import { z } from "zod";

// Re-create literals to stay decoupled from external module imports
export const PrioritySchema = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof PrioritySchema>;

export const AiTaskStateSchema = z.enum([
	"pending",
	"running",
	"success",
	"failed",
	"blocked",
	"requires_oauth",
]);
export type AiTaskState = z.infer<typeof AiTaskStateSchema>;

// Sub-types used by Kanban Task
export const TaskActivitySchema = z.object({
	action: z.enum(["created", "updated", "deleted"]),
	timestamp: z.coerce.date(),
	performedBy: z.string().min(1),
});
export type TaskActivity = z.infer<typeof TaskActivitySchema>;

export const MCPPromptSchema = z.object({
	text: z.string().min(1),
	description: z.string().min(1),
	role: z.string().optional(),
});

export const MCPFunctionSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
	signature: z.string().min(1),
	exampleArgs: z.record(z.unknown()).optional(),
});

export const MCPResourceSchema = z.object({
	uri: z.string().min(1),
	type: z.string().min(1),
	description: z.string().optional(),
});

export const MCPWorkflowResultSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.record(z.any()),
	z.null(),
]);

export const MCPWorkflowRatingSchema = z.object({
	rating: z.number().min(0).max(5),
	comment: z.string(),
});

export const MCPWorkflowSchema = z.object({
	id: z.string().min(1),
	title: z.string().min(1),
	prompts: z.array(MCPPromptSchema).default([]),
	functions: z.array(MCPFunctionSchema).default([]),
	resources: z.array(MCPResourceSchema).default([]),
	status: z.enum(["pending", "running", "success", "error"]).optional(),
	lastRunAt: z.string().optional(),
	lastResult: MCPWorkflowResultSchema.optional(),
	rating: MCPWorkflowRatingSchema.optional(),
});

// Attachment items referenced by task
export const AttachmentSchema = z.object({
	filename: z.string().min(1),
	url: z.string().url(),
});

// Create-input schema for a new task (id generated server/client-side)
// Includes all fields, with sensible optionals mirroring the TS interface.
export const CreateKanbanTaskSchema = z.object({
	// Optional if generated; allow passing explicitly for imports/seeding
	id: z.string().optional(),

	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),

	// Free-form status to keep compatibility with external module Status = string
	status: z.string().min(1, "Status is required"),

	priority: PrioritySchema.optional(),
	dueDate: z.string().optional(),
	appointmentDate: z.string().optional(),
	appointmentTime: z.string().optional(),

	assignedToTeamMember: z.string().optional(),
	leadId: z.string().optional(),
	leadListId: z.string().optional(),

	activityLog: z.array(TaskActivitySchema).optional(),
	mcpWorkflow: MCPWorkflowSchema.optional(),

	attachments: z.array(AttachmentSchema).optional(),
	youtubeUrl: z.string().url().optional(),
	outputVideoUrl: z.string().url().optional(),

	aiState: AiTaskStateSchema.optional(),
	aiErrorMessage: z.string().optional(),
	aiMissingParams: z.array(z.string()).optional(),

	aiStartedAt: z.string().optional(),
	aiEtaSeconds: z.number().optional(),
	aiStreamText: z.string().optional(),
});

export type KanbanTaskCreateInput = z.infer<typeof CreateKanbanTaskSchema>;

// Partial update schema (optional helper if needed elsewhere)
export const UpdateKanbanTaskSchema = CreateKanbanTaskSchema.partial().extend({
	id: z.string().min(1),
});
export type KanbanTaskUpdateInput = z.infer<typeof UpdateKanbanTaskSchema>;
