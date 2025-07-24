import type { TeamMember } from "../userProfile";
import type { LeadList } from "./leadList";
import type { LeadTypeGlobal } from "./leads";

export interface KanbanColumn {
	id: string;
	title: string;
}
export type Status = string;

const defaultCols = [
	{
		id: "TODO",
		title: "To Do",
	},
	{
		id: "IN_PROGRESS",
		title: "In Progress",
	},
	{
		id: "DONE",
		title: "Done",
	},
] satisfies KanbanColumn[];

export type ColumnId = (typeof defaultCols)[number]["id"];
export type Priority = "low" | "medium" | "high";

export interface TaskActivity {
	action: "created" | "updated" | "deleted";
	timestamp: Date;
	performedBy: string; // Name of the person who performed the action
}

export interface TaskTracking {
	totalTasks: number;
	tasksByStatus: {
		TODO: number;
		IN_PROGRESS: number;
		DONE: number;
	};
	tasksAssigned: number;
	tasksCompleted: number;
	tasksInProgress: number;
	assignedTasks: Record<string, KanbanTask[]>; // Tracks tasks by team member
	taskHistory: TaskActivity[]; // History of all task actions
}
// * MCPWorkflow types for AI-driven task automation
export interface MCPPrompt {
	/** Instruction or context for this step */
	text: string;
	description: string;
	/** Optional: role or system context (e.g., 'user', 'system', 'assistant') */
	role?: string;
}

export interface MCPFunction {
	/** Name of the function (for AI invocation) */
	name: string;
	/** Short description of what the function does */
	description: string;
	/** Function signature or type, e.g., '(input: string) => Promise<Result>' */
	signature: string;
	/** Optional: Example usage or parameters */
	exampleArgs?: Record<string, unknown>; // ! Use unknown for biome compliance and type safety
}

export interface MCPResource {
	/** URI or identifier for the resource */
	uri: string;
	/** Type of resource (e.g., 'doc', 'api', 'file') */
	type: string;
	/** Optional: Short description */
	description?: string;
}

export type MCPWorkflowResult = string | number | boolean | object | null; // ! Extend as needed for workflow outputs
export interface MCPWorkflowRating {
	rating: number;
	comment: string;
}
export interface MCPWorkflow {
	id: string;
	title: string;
	prompts: MCPPrompt[];
	functions: MCPFunction[];
	resources: MCPResource[];
	/** Optional: Status or last run result */
	status?: "pending" | "running" | "success" | "error";
	lastRunAt?: string; // ISO date
	// ! Use MCPWorkflowResult instead of any for biome compliance
	lastResult?: MCPWorkflowResult;
	rating?: MCPWorkflowRating;
}

// * KanbanTask now supports optional AI workflow orchestration
export interface KanbanTask {
	id: string;
	title: string;
	description?: string;
	status: Status;
	priority?: Priority;
	dueDate?: string; // YYYY-MM-DD format
	appointmentDate?: string;
	appointmentTime?: string;
	assignedToTeamMember?: string | undefined;
	leadId?: string | undefined;
	leadListId?: string | undefined;
	activityLog?: TaskActivity[]; // Log of task activities
	// ! Optional MCP workflow for AI/automation (used to trigger Play button)
	mcpWorkflow?: MCPWorkflow;
}

export type KanbanState = {
	tasks: KanbanTask[];
	columns: KanbanColumn[];
	draggedTask: string | null;
};
