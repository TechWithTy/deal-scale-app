import type {
	KanbanColumn,
	KanbanState,
	KanbanTask,
	Priority,
	Status,
} from "@/types/_dashboard/kanban";
import { faker } from "@faker-js/faker";
import { NEXT_PUBLIC_APP_TESTING_MODE, mockGeneratedLeads } from "../../data";

// Default column structure with status-based `id`
export const defaultCols: KanbanColumn[] = [
	{
		id: "Backlog",
		title: "Backlog",
	},
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
];

import type {
	MCPWorkflow,
	MCPPrompt,
	MCPFunction,
	MCPResource,
	MCPWorkflowRating,
} from "@/types/_dashboard/kanban";
import { mockLeadListData } from "@/constants/dashboard/leadList";

export const generateMockTasks = (count: number): KanbanTask[] => {
	const statuses: Status[] = ["Backlog", "TODO", "IN_PROGRESS", "DONE"];
	const priorities: Priority[] = ["low", "medium", "high"];
	const workflowStatuses = ["pending", "running", "success", "error"] as const;

	// When NEXT_PUBLIC_APP_TESTING_MODE is false, mockGeneratedLeads can be falsy.
	// Coalesce to a safe empty array and use a runtime guard before selecting.
	const safeLeads = (
		Array.isArray(mockGeneratedLeads) ? mockGeneratedLeads : []
	) as Array<{ id: string }>;

	// Coalesce lead lists as well, since mockLeadListData may be false when testing mode is off
	const safeLeadLists = (
		Array.isArray(mockLeadListData) ? mockLeadListData : []
	) as Array<{ id: string }>;

	function randomPrompt(): MCPPrompt {
		return {
			text: faker.lorem.sentence(),
			role: faker.helpers.arrayElement(["user", "assistant", "system"]),
			description: faker.lorem.sentence(),
		};
	}

	function randomFunction(): MCPFunction {
		return {
			name: faker.hacker.verb() + faker.string.alpha(3),
			description: faker.company.catchPhrase(),
			signature: "(input: string) => Promise<string>;",
			exampleArgs: { input: faker.lorem.words(3) },
		};
	}

	function randomResource(): MCPResource {
		return {
			uri: faker.internet.url(),
			type: faker.helpers.arrayElement(["doc", "api", "file"]),
			description: faker.lorem.words(5),
		};
	}

	function randomRating(): MCPWorkflowRating {
		return {
			rating: faker.number.int({ min: 0, max: 5 }),
			comment: faker.lorem.sentence(),
		};
	}

	function maybeWorkflow(): MCPWorkflow | undefined {
		if (Math.random() < 0.4) {
			// 40% chance to include a workflow
			return {
				id: faker.string.uuid(),
				title: faker.company.catchPhrase(),
				prompts: Array.from(
					{ length: faker.number.int({ min: 1, max: 3 }) },
					randomPrompt,
				),
				functions: Array.from(
					{ length: faker.number.int({ min: 1, max: 2 }) },
					randomFunction,
				),
				resources: Array.from(
					{ length: faker.number.int({ min: 1, max: 2 }) },
					randomResource,
				),
				status: faker.helpers.arrayElement(workflowStatuses),

				lastRunAt:
					Math.random() > 0.5 ? faker.date.recent().toISOString() : undefined,
				lastResult: Math.random() > 0.5 ? faker.lorem.sentence() : null,
				rating: randomRating(),
			};
		}
		return undefined;
	}

	return Array.from({ length: count }, () => {
		const status = faker.helpers.arrayElement(statuses); // Random status for the task
		const priority = faker.helpers.arrayElement(priorities); // Random priority
		const dueDate = faker.date.future().toISOString().split("T")[0]; // Future date in YYYY-MM-DD format
		const assignedToTeamMember = faker.person.fullName(); // Random team member name

		return {
			id: faker.string.uuid(),
			title: faker.company.catchPhrase(),
			description: faker.lorem.sentences(2),
			status,
			priority,
			appointmentDate: faker.date.future().toISOString().split("T")[0], // Future date in YYYY-MM-DD format
			appointmentTime: faker.date.future().toISOString().split("T")[1], // Future time in HH:mm:ss format	,
			dueDate,
			assignedToTeamMember,
			// Only pick a leadId if we actually have leads; otherwise fall back to a leadListId
			...(safeLeads.length > 0 && Math.random() > 0.5
				? { leadId: faker.helpers.arrayElement(safeLeads).id }
				: { leadListId: faker.helpers.arrayElement(safeLeadLists).id }),
			mcpWorkflow: maybeWorkflow(),
		};
	});
};
// Function to generate the initial Kanban state with Faker data
export const generateKanbanState = (taskCount: number): KanbanState => {
	const tasks = generateMockTasks(taskCount);

	// Organize tasks into columns based on their status
	const columns = defaultCols.map((column) => ({
		...column,
		taskIds: tasks
			.filter((task) => task.status === column.id) // Only add tasks matching the column's status
			.map((task) => task.id), // Collect task IDs
	}));

	return {
		tasks,
		columns,
		draggedTask: null, // Initially, no task is being dragged
	};
};

// Example usage: Generate a Kanban state with 10 tasks
export const mockKanbanState: KanbanState | false =
	NEXT_PUBLIC_APP_TESTING_MODE && generateKanbanState(10);
