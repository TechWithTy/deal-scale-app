import { mockUserProfile } from "@/constants/_faker/profile/userProfile";
import type {
	KanbanColumn,
	KanbanState,
	KanbanTask,
} from "@/types/_dashboard/kanban";
import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const initialTasks: KanbanTask[] = [
	{
		id: "task1",
		title: "Design New Landing Page",
		description:
			"Create a responsive design for the new product launch landing page.",
		status: "IN_PROGRESS",
		priority: "high",
		dueDate: "2024-09-20",
		assignedToTeamMember: "team_member_1",
	},
	{
		id: "task2",
		title: "Optimize SEO Strategy",
		description:
			"Revise the SEO plan for improved search rankings in the next quarter.",
		status: "TODO",
		priority: "medium",
		dueDate: "2024-09-25",
		assignedToTeamMember: "team_member_2",
	},
	{
		id: "task3",
		title: "Client Onboarding",
		description:
			"Guide the new client through the onboarding process and answer any questions.",
		status: "TODO",
		priority: "high",
		dueDate: "2024-09-18",
		assignedToTeamMember: "team_member_3",
	},
	{
		id: "task4",
		title: "Monthly Performance Report",
		description:
			"Compile and present the monthly performance report to the management team.",
		status: "DONE",
		priority: "low",
		dueDate: "2024-09-10",
		assignedToTeamMember: "team_member_4",
	},
	{
		id: "task5",
		title: "Content Plan for Social Media",
		description:
			"Develop a content calendar for the upcoming quarter’s social media posts.",
		status: "IN_PROGRESS",
		priority: "medium",
		dueDate: "2024-09-30",
		assignedToTeamMember: "team_member_5",
	},
];

export type Actions = {
	addTask: (title: string, description?: string) => void;
	addCol: (title: string) => void;
	dragTask: (id: string | null) => void;
	removeTask: (title: string) => void;
	removeCol: (id: string) => void;
	setTasks: (updatedTask: KanbanTask[]) => void;
	setCols: (cols: KanbanColumn[]) => void;
	updateCol: (id: string, newName: string) => void;
};

export const useTaskStore = create<KanbanState & Actions>()(
	persist(
		(set) => ({
			tasks: mockUserProfile.companyInfo.KanbanTasks.tasks,
			columns: mockUserProfile.companyInfo.KanbanTasks.columns,
			draggedTask: null,
			addTask: (title: string, description?: string) =>
				set((state) => ({
					tasks: [
						...state.tasks,
						{ id: uuid(), title, description, status: "TODO" },
					],
				})),
			updateCol: (id: string, newName: string) =>
				set((state) => ({
					columns: state.columns.map((col) =>
						col.id === id ? { ...col, title: newName } : col,
					),
				})),
			addCol: (title: string) =>
				set((state) => ({
					columns: [
						...state.columns,
						{ title, id: state.columns.length ? title.toUpperCase() : "TODO" },
					],
				})),
			dragTask: (id: string | null) => set({ draggedTask: id }),
			removeTask: (id: string) =>
				set((state) => ({
					tasks: state.tasks.filter((task) => task.id !== id),
				})),
			removeCol: (id: string) =>
				set((state) => ({
					columns: state.columns.filter((col) => col.id !== id),
				})),
			setTasks: (newTasks: KanbanTask[]) => set({ tasks: newTasks }),
			setCols: (newCols: KanbanColumn[]) => set({ columns: newCols }),
		}),
		{ name: "task-store", skipHydration: true },
	),
);
