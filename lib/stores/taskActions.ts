import { mockKanbanState } from "@/constants/_faker/kanban";
import type {
	KanbanColumn,
	KanbanState,
	KanbanTask as BaseKanbanTask,
} from "@/types/_dashboard/kanban";

// * Extend KanbanTask to include appointmentDate
export type KanbanTask = BaseKanbanTask & {
	appointmentDate?: string;
	leadId?: string;
	leadListId?: string;
	assignedToTeamMember?: string;
};
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
		// * Demo MCPWorkflow for AI/automation
		mcpWorkflow: {
			id: "wf-landing-page-design-001",
			title: "Landing Page Design Workflow",
			prompts: [
				{
					text: "Analyze requirements and gather design inspiration for a SaaS product landing page.",
					role: "system",
					description:
						"Analyze requirements and gather design inspiration for a SaaS product landing page.",
				},
				{
					text: "Generate a wireframe and suggest a color palette based on modern UI/UX trends.",
					role: "assistant",
					description:
						"Generate a wireframe and suggest a color palette based on modern UI/UX trends.",
				},
				{
					text: "Export the wireframe as a Figma link and summarize the design rationale.",
					role: "user",
					description:
						"Export the wireframe as a Figma link and summarize the design rationale.",
				},
			],
			functions: [
				{
					name: "generateWireframe",
					description:
						"Creates a wireframe for a landing page based on provided requirements.",
					signature:
						"(requirements: string) => Promise<{ wireframeUrl: string }>;",
					exampleArgs: {
						requirements: "SaaS, hero section, signup form, testimonials",
					},
				},
				{
					name: "suggestColorPalette",
					description:
						"Suggests a modern color palette for SaaS landing pages.",
					signature: "() => Promise<string[]>;",
				},
			],
			resources: [
				{
					uri: "https://www.figma.com/community/file/12345-Landing-Page-Wireframe",
					type: "file",
					description: "Sample Figma wireframe for SaaS landing pages.",
				},
				{
					uri: "https://refactoringui.com/book/",
					type: "doc",
					description: "UI/UX best practices reference.",
				},
			],
			status: "pending",
			lastRunAt: undefined,
			lastResult: null,
			rating: {
				rating: 0,
				comment: "Workflow not yet run.",
			},
		},
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

// ! Update Actions type for new addTask signature
// ! Updated to support dueDate (required) and appointmentTime (optional)
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
	) => void;
	addCol: (title: string) => void;
	dragTask: (id: string | null) => void;
	removeTask: (id: string) => void;
	removeCol: (id: string) => void;
	setTasks: (updatedTask: KanbanTask[]) => void;
	setCols: (cols: KanbanColumn[]) => void;
	updateCol: (id: string, newName: string) => void;
}

export const useTaskStore = create<KanbanState & Actions>()(
	persist(
		(set) => ({
			tasks: mockKanbanState.tasks,
			columns: mockKanbanState.columns,
			draggedTask: null,
			// ! Updated to accept assignment, lead/link info, dueDate, appointmentDate, and appointmentTime
			addTask: (
				title,
				description,
				assignedToTeamMember,
				dueDate,
				appointmentDate,
				appointmentTime,
				leadId,
				leadListId,
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
						},
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
					columns: [...state.columns, { title, id: uuid() }],
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
