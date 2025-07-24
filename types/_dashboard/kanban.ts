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
export interface KanbanTask {
	id: string;
	title: string;
	description?: string;
	status: Status;
	priority?: Priority;
	dueDate?: string; // YYYY-MM-DD format
	assignedToTeamMember?: string;
	activityLog?: TaskActivity[]; // Log of task activities
}

export type KanbanState = {
	tasks: KanbanTask[];
	columns: KanbanColumn[];
	draggedTask: string | null;
};
