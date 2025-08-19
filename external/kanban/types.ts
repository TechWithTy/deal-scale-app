// Local Kanban types for the self-contained external module

export interface KanbanColumn {
	id: string;
	title: string;
}
export type Status = string;
export type Priority = "low" | "medium" | "high";

// AI workflow state for tasks
export type AiTaskState =
	| "pending"
	| "running"
	| "success"
	| "failed"
	| "blocked"
	| "requires_oauth";

export interface TaskActivity {
	action: "created" | "updated" | "deleted";
	timestamp: Date;
	performedBy: string;
}

export interface MCPPrompt {
	text: string;
	description: string;
	role?: string;
}
export interface MCPFunction {
	name: string;
	description: string;
	signature: string;
	exampleArgs?: Record<string, unknown>;
}
export interface MCPResource {
	uri: string;
	type: string;
	description?: string;
}
export type MCPWorkflowResult = string | number | boolean | object | null;
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
	status?: "pending" | "running" | "success" | "error";
	lastRunAt?: string;
	lastResult?: MCPWorkflowResult;
	rating?: MCPWorkflowRating;
}

export interface KanbanTask {
	id: string;
	title: string;
	description?: string;
	status: Status;
	priority?: Priority;
	dueDate?: string;
	appointmentDate?: string;
	appointmentTime?: string;
	assignedToTeamMember?: string | undefined;
	leadId?: string | undefined;
	leadListId?: string | undefined;
	activityLog?: TaskActivity[];
	mcpWorkflow?: MCPWorkflow;
	// Asset attachments and media
	attachments?: { filename: string; url: string }[]; // downloadable files/links
	youtubeUrl?: string; // YouTube URL to preview/link
	outputVideoUrl?: string; // optional output video (mp4/webm) to render in player
	// AI-specific metadata
	aiState?: AiTaskState;
	aiErrorMessage?: string;
	aiMissingParams?: string[]; // used when "blocked"
	// Runtime metadata for running state
	aiStartedAt?: string; // ISO timestamp when run started
	aiEtaSeconds?: number; // estimated seconds to completion
	aiStreamText?: string; // latest streaming text chunk
}

export type KanbanState = {
	tasks: KanbanTask[];
	columns: KanbanColumn[];
	draggedTask: string | null;
};

// Minimal local types used by mocks/UI
export interface TeamMember {
	id: string;
	firstName: string;
	lastName: string;
}

export interface LeadContactInfo {
	firstName: string;
	lastName: string;
}
export interface Lead {
	id: string;
	contactInfo: LeadContactInfo;
}

export interface LeadListItem {
	id: string | number;
	listName: string;
}
