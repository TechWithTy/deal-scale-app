import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { KanbanColumn, KanbanState } from "./types";
import type { AiTaskState } from "./types";
import type { KanbanTask as BaseKanbanTask } from "./types";
import { defaultCols, mockKanbanState } from "./mocks";

export type KanbanTask = BaseKanbanTask & {
	appointmentDate?: string;
	leadId?: string;
	leadListId?: string;
	assignedToTeamMember?: string;
};

const safeKanbanState: KanbanState = mockKanbanState || {
	tasks: [],
	columns: defaultCols,
	draggedTask: null,
};

interface Actions {
	addTask: (
		title: string,
		description: string,
		assignedToTeamMember: string,
		dueDate: string,
		appointmentDate?: string,
		appointmentTime?: string,
		leadId?: string,
		leadListId?: string,
		youtubeUrl?: string,
		outputVideoUrl?: string,
		attachments?: { filename: string; url: string }[],
	) => void;
	addCol: (title: string) => void;
	dragTask: (id: string | null) => void;
	removeTask: (id: string) => void;
	removeCol: (id: string) => void;
	setTasks: (updatedTask: KanbanTask[]) => void;
	setCols: (cols: KanbanColumn[]) => void;
	updateCol: (id: string, newName: string) => void;
	// Update existing task
	updateTask: (
		id: string,
		updates: Partial<
			Pick<
				KanbanTask,
				| "title"
				| "description"
				| "status"
				| "priority"
				| "dueDate"
				| "appointmentDate"
				| "appointmentTime"
				| "assignedToTeamMember"
				| "leadId"
				| "leadListId"
			>
		> & {
			attachments?: { filename: string; url: string }[];
			youtubeUrl?: string;
			outputVideoUrl?: string;
		},
	) => void;
	// AI workflow state actions
	runAi: (id: string) => void;
	successAi: (id: string) => void;
	failAi: (id: string, error?: string) => void;
	retryAi: (id: string) => void;
	cancelAi: (id: string) => void;
	requireOAuth: (id: string) => void;
	resolveOAuth: (id: string) => void;
	setAiBlocked: (id: string, missingParams: string[]) => void;
	setAiPending: (id: string) => void;
}

export const useTaskStore = create<KanbanState & Actions>()(
	persist(
		(set) => ({
			tasks: safeKanbanState.tasks,
			columns: safeKanbanState.columns,
			draggedTask: null,
			addTask: (
				title,
				description,
				assignedToTeamMember,
				dueDate,
				appointmentDate,
				appointmentTime,
				leadId,
				leadListId,
				youtubeUrl,
				outputVideoUrl,
				attachments,
			) =>
				set((state) => ({
					tasks: [
						...state.tasks,
						{
							id: uuid(),
							title,
							description,
							status: "TODO",
							assignedToTeamMember: assignedToTeamMember || undefined,
							leadId: leadId || undefined,
							leadListId: leadListId || undefined,
							dueDate,
							...(appointmentTime ? { appointmentTime } : {}),
							...(appointmentDate ? { appointmentDate } : {}),
							...(youtubeUrl ? { youtubeUrl } : {}),
							...(outputVideoUrl ? { outputVideoUrl } : {}),
							...(attachments && attachments.length ? { attachments } : {}),
						},
					],
				})),
			updateTask: (id, updates) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? {
									...t,
									...updates,
									...(updates.youtubeUrl !== undefined
										? { youtubeUrl: updates.youtubeUrl }
										: {}),
									...(updates.outputVideoUrl !== undefined
										? { outputVideoUrl: updates.outputVideoUrl }
										: {}),
									...(updates.attachments !== undefined
										? { attachments: updates.attachments }
										: {}),
								}
							: t,
					),
				})),
			updateCol: (id: string, newName: string) =>
				set((state) => ({
					columns: state.columns.map((col) =>
						String(col.id) === String(id) ? { ...col, title: newName } : col,
					),
				})),
			// ---- AI state actions ----
			runAi: (id: string) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? {
									...t,
									aiState:
										(t.aiState as AiTaskState) === "blocked"
											? "blocked"
											: "running",
									aiErrorMessage: undefined,
									status: "IN_PROGRESS",
									aiStartedAt: new Date().toISOString(),
									aiEtaSeconds: t.aiEtaSeconds ?? 60,
									aiStreamText: "",
								}
							: t,
					),
				})),
			successAi: (id: string) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? {
									...t,
									aiState: "success",
									status: "DONE",
									aiStartedAt: undefined,
									aiEtaSeconds: undefined,
									aiStreamText: undefined,
								}
							: t,
					),
				})),
			failAi: (id: string, error?: string) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? {
									...t,
									aiState: "failed",
									aiErrorMessage: error || "Workflow failed",
									aiStartedAt: undefined,
									aiEtaSeconds: undefined,
									aiStreamText: undefined,
								}
							: t,
					),
				})),
			retryAi: (id: string) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? {
									...t,
									aiState: "running",
									status: "IN_PROGRESS",
									aiErrorMessage: undefined,
									aiStartedAt: new Date().toISOString(),
									aiEtaSeconds: t.aiEtaSeconds ?? 60,
									aiStreamText: "",
								}
							: t,
					),
				})),
			cancelAi: (id: string) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? {
									...t,
									aiState: "pending",
									status: "TODO",
									aiStartedAt: undefined,
									aiEtaSeconds: undefined,
									aiStreamText: undefined,
								}
							: t,
					),
				})),
			requireOAuth: (id: string) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? { ...t, aiState: "requires_oauth" }
							: t,
					),
				})),
			resolveOAuth: (id: string) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id) ? { ...t, aiState: "pending" } : t,
					),
				})),
			setAiBlocked: (id: string, missingParams: string[]) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? { ...t, aiState: "blocked", aiMissingParams: missingParams }
							: t,
					),
				})),
			setAiPending: (id: string) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? { ...t, aiState: "pending", aiMissingParams: [] }
							: t,
					),
				})),
			addCol: (title: string) =>
				set((state) => ({
					columns: [...state.columns, { title, id: uuid() }],
				})),
			dragTask: (id: string | null) => set({ draggedTask: id }),
			removeTask: (id: string) =>
				set((state) => ({
					tasks: state.tasks.filter((task) => String(task.id) !== String(id)),
				})),
			removeCol: (id: string) =>
				set((state) => ({
					columns: state.columns.filter((col) => String(col.id) !== String(id)),
				})),
			setTasks: (newTasks: KanbanTask[]) => set({ tasks: newTasks }),
			setCols: (newCols: KanbanColumn[]) => set({ columns: newCols }),
		}),
		{ name: "external-task-store", skipHydration: true },
	),
);
