import { useTaskStore } from "@/lib/stores/taskActions";
import type { KanbanTask as BaseKanbanTask } from "@/types/_dashboard/kanban";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

export type AITaskSource = "ai" | "manual";

export type AITask = BaseKanbanTask & {
	source: AITaskSource;
	confidence?: number;
};

type AddAiTaskInput = Partial<AITask> & Pick<AITask, "title">;

interface AITasksState {
	aiTasks: AITask[];
	addAiTask: (input: AddAiTaskInput) => string; // returns id
	updateAiTask: (id: string, patch: Partial<AITask>) => void;
	removeAiTask: (id: string) => void;
	clear: () => void;
	promoteToBoard: (id: string) => void;
}

function todayIsoDate() {
	return new Date().toISOString().slice(0, 10);
}

export const useAITasksStore = create<AITasksState>((set, get) => ({
	aiTasks: [],

	addAiTask: (input) => {
		const id = uuidv4();
		const task: AITask = {
			id,
			title: input.title,
			description: input.description,
			status: input.status ?? "TODO",
			priority: input.priority,
			dueDate: input.dueDate ?? todayIsoDate(),
			appointmentDate: input.appointmentDate,
			appointmentTime: input.appointmentTime,
			assignedToTeamMember: input.assignedToTeamMember,
			leadId: input.leadId,
			leadListId: input.leadListId,
			activityLog: input.activityLog,
			youtubeUrl: input.youtubeUrl,
			mcpWorkflow: input.mcpWorkflow,
			source: input.source ?? "ai",
			confidence: input.confidence,
		};
		set((s) => ({ aiTasks: [task, ...s.aiTasks] }));
		return id;
	},

	updateAiTask: (id, patch) =>
		set((s) => ({
			aiTasks: s.aiTasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
		})),

	removeAiTask: (id) =>
		set((s) => ({ aiTasks: s.aiTasks.filter((t) => t.id !== id) })),

	clear: () => set({ aiTasks: [] }),

	promoteToBoard: (id) => {
		const t = get().aiTasks.find((x) => x.id === id);
		if (!t) return;
		// Map into useTaskStore.addTask signature
		const add = useTaskStore.getState().addTask;
		add(
			t.title,
			t.description ?? "",
			t.assignedToTeamMember ?? "",
			t.dueDate ?? todayIsoDate(),
			t.appointmentDate,
			t.appointmentTime,
			t.leadId,
			t.leadListId,
			t.youtubeUrl,
			undefined,
			undefined,
		);
		// Optionally remove after promotion
		set((s) => ({ aiTasks: s.aiTasks.filter((x) => x.id !== id) }));
	},
}));
