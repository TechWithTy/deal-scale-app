import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type { KanbanColumn, KanbanState } from "./types";
import type { AiTaskState } from "./types";
import type { KanbanTask as BaseKanbanTask } from "./types";
import { defaultCols, mockKanbanState } from "./mocks";

export type KanbanTask = BaseKanbanTask & {
	appointmentDate?: string;
	appointmentTimezone?: string;
	scheduledDate?: string;
	scheduledTimezone?: string;
	leadId?: string;
	leadListId?: string;
	assignedToTeamMember?: string;
	aiState?: AiTaskState;
	aiErrorMessage?: string;
	aiMissingParams?: string[];
	aiStartedAt?: string;
	aiEtaSeconds?: number;
	aiStreamText?: string;
	outputAttachments?: { filename: string; url: string }[];
	outputImageUrl?: string;
	outputMarkdown?: string;
	outputVideoUrl?: string;
	costType?: "ai" | "leads" | "skipTraces";
	costAmount?: number;
};

const safeKanbanState: KanbanState = mockKanbanState || {
	tasks: [],
	columns: defaultCols,
	draggedTask: null,
};

interface Actions {
	addTask: (...args: AddTaskArgs) => void;
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
				| "scheduledDate"
				| "scheduledTimezone"
				| "appointmentDate"
				| "appointmentTime"
				| "appointmentTimezone"
				| "assignedToTeamMember"
				| "leadId"
				| "leadListId"
				| "outputImageUrl"
				| "outputMarkdown"
				| "outputAttachments"
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

type LegacyAddTaskArgs = [
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
];

type ExtendedAddTaskArgs = [
	title: string,
	description: string,
	assignedToTeamMember: string,
	dueDate: string,
	scheduledDate?: string,
	scheduledTimezone?: string,
	appointmentDate?: string,
	appointmentTime?: string,
	appointmentTimezone?: string,
	leadId?: string,
	leadListId?: string,
	youtubeUrl?: string,
	outputVideoUrl?: string,
	attachments?: { filename: string; url: string }[],
];

type AddTaskArgs = LegacyAddTaskArgs | ExtendedAddTaskArgs;

function normalizeAddTaskArgs(args: AddTaskArgs) {
	const values = [...args] as Array<
		string | { filename: string; url: string }[] | undefined
	>;
	const [
		title,
		description,
		assignedToTeamMember,
		dueDate,
		fifth,
		sixth,
		seventh,
		eighth,
		ninth,
		tenth,
		eleventh,
		twelfth,
		thirteenth,
		fourteenth,
	] = values;

	if (values.length >= 14) {
		return {
			title: title ?? "",
			description: description ?? "",
			assignedToTeamMember: assignedToTeamMember ?? "",
			dueDate: dueDate ?? "",
			scheduledDate: fifth,
			scheduledTimezone: sixth,
			appointmentDate: seventh,
			appointmentTime: eighth,
			appointmentTimezone: ninth,
			leadId: tenth,
			leadListId: eleventh,
			youtubeUrl: twelfth,
			outputVideoUrl: thirteenth,
			attachments: fourteenth,
		};
	}

	return {
		title: title ?? "",
		description: description ?? "",
		assignedToTeamMember: assignedToTeamMember ?? "",
		dueDate: dueDate ?? "",
		appointmentDate: fifth,
		appointmentTime: sixth,
		leadId: seventh,
		leadListId: eighth,
		youtubeUrl: ninth,
		outputVideoUrl: tenth,
		attachments: eleventh,
	};
}

export const useTaskStore = create<KanbanState & Actions>()(
	persist(
		(set) => ({
			tasks: safeKanbanState.tasks,
			columns: safeKanbanState.columns,
			draggedTask: null,
			addTask: (...args) => {
				const normalized = normalizeAddTaskArgs(args);
				set((state) => ({
					tasks: [
						...state.tasks,
						{
							id: uuid(),
							title: normalized.title,
							description: normalized.description,
							status: "TODO",
							assignedToTeamMember:
								normalized.assignedToTeamMember || undefined,
							leadId: normalized.leadId || undefined,
							leadListId: normalized.leadListId || undefined,
							dueDate: normalized.dueDate,
							...(normalized.scheduledDate
								? { scheduledDate: normalized.scheduledDate }
								: {}),
							...(normalized.scheduledTimezone
								? { scheduledTimezone: normalized.scheduledTimezone }
								: {}),
							...(normalized.appointmentDate
								? { appointmentDate: normalized.appointmentDate }
								: {}),
							...(normalized.appointmentTime
								? { appointmentTime: normalized.appointmentTime }
								: {}),
							...(normalized.appointmentTimezone
								? { appointmentTimezone: normalized.appointmentTimezone }
								: {}),
							...(normalized.youtubeUrl
								? { youtubeUrl: normalized.youtubeUrl }
								: {}),
							...(normalized.outputVideoUrl
								? { outputVideoUrl: normalized.outputVideoUrl }
								: {}),
							...(normalized.attachments?.length
								? { attachments: normalized.attachments }
								: {}),
						},
					],
				}));
			},
			updateTask: (id, updates) =>
				set((state) => ({
					tasks: state.tasks.map((t) =>
						String(t.id) === String(id)
							? {
									...t,
									...updates,
									...(updates.scheduledDate !== undefined
										? { scheduledDate: updates.scheduledDate }
										: {}),
									...(updates.youtubeUrl !== undefined
										? { youtubeUrl: updates.youtubeUrl }
										: {}),
									...(updates.outputVideoUrl !== undefined
										? { outputVideoUrl: updates.outputVideoUrl }
										: {}),
									...(updates.outputImageUrl !== undefined
										? { outputImageUrl: updates.outputImageUrl }
										: {}),
									...(updates.outputMarkdown !== undefined
										? { outputMarkdown: updates.outputMarkdown }
										: {}),
									...(updates.outputAttachments !== undefined
										? { outputAttachments: updates.outputAttachments }
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
					tasks: state.tasks.map((t) => {
						if (String(t.id) !== String(id)) return t;
						const exampleImg = t.outputImageUrl ?? "/next.svg"; // sample image from public
						const exampleMd =
							t.outputMarkdown ??
							"# AI Result\n\n**Success!** Your AI task has completed.\n\n- This is example markdown output.\n- You can replace it with real workflow results.\n\nVisit [Deal Scale App](https://github.com/TechWithTy/deal-scale-app).";
						return {
							...t,
							aiState: "success",
							status: "DONE",
							aiStartedAt: undefined,
							aiEtaSeconds: undefined,
							aiStreamText: undefined,
							outputImageUrl: exampleImg,
							outputMarkdown: exampleMd,
						};
					}),
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
		{ name: "task-store", skipHydration: true },
	),
);
