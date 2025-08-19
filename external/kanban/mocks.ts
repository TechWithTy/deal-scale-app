import type {
	KanbanColumn,
	KanbanState,
	KanbanTask,
	Lead,
	LeadListItem,
	TeamMember,
} from "./types";

export const defaultCols: KanbanColumn[] = [
	{ id: "TODO", title: "To Do" },
	{ id: "IN_PROGRESS", title: "In Progress" },
	{ id: "DONE", title: "Done" },
];

// Simple team member list
export const mockTeamMembers: TeamMember[] = [
	{ id: "team_member_1", firstName: "Alex", lastName: "Johnson" },
	{ id: "team_member_2", firstName: "Sam", lastName: "Patel" },
	{ id: "team_member_3", firstName: "Jamie", lastName: "Lee" },
	{ id: "team_member_4", firstName: "Taylor", lastName: "Nguyen" },
	{ id: "team_member_5", firstName: "Jordan", lastName: "Martinez" },
];

// Minimal generated leads
export const mockGeneratedLeads: Lead[] = [
	{ id: "lead_1", contactInfo: { firstName: "Chris", lastName: "Doe" } },
	{ id: "lead_2", contactInfo: { firstName: "Morgan", lastName: "Smith" } },
	{ id: "lead_3", contactInfo: { firstName: "Riley", lastName: "Brown" } },
];

// Minimal lead list data
export const mockLeadListData: LeadListItem[] = [
	{ id: 101, listName: "Warm Prospects" },
	{ id: 102, listName: "Follow-up Q3" },
	{ id: 103, listName: "Cold Outreach" },
];

// Example tasks to populate the board
export const mockTasks: KanbanTask[] = [
	{
		id: "task_1",
		title: "Qualify new inbound leads",
		description: "Review inbound leads and tag qualified prospects.",
		status: "TODO",
		priority: "medium",
		dueDate: new Date().toISOString().slice(0, 10),
		assignedToTeamMember: mockTeamMembers[0]?.id,
		leadId: mockGeneratedLeads[0]?.id,
		attachments: [{ filename: "lead-list.csv", url: "/static/lead-list.csv" }],
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		outputVideoUrl:
			"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
	},
	{
		id: "task_2",
		title: "Prepare outreach sequence",
		description: "Draft email and SMS touchpoints for warm prospects.",
		status: "IN_PROGRESS",
		priority: "high",
		dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
		assignedToTeamMember: mockTeamMembers[1]?.id,
		leadListId: String(mockLeadListData[0]?.id),
		aiState: "running",
		aiStartedAt: new Date(Date.now() - 15_000).toISOString(),
		aiEtaSeconds: 90,
		aiStreamText: "Analyzing leads… extracting key intents and priorities…",
		attachments: [
			{ filename: "requirements.pdf", url: "/static/requirements.pdf" },
		],
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		outputVideoUrl:
			"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
	},
	{
		id: "task_3",
		title: "Schedule demo with Chris Doe",
		description: "Confirm calendar slot and send invite.",
		status: "DONE",
		priority: "low",
		dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
		appointmentDate: new Date().toISOString().slice(0, 10),
		appointmentTime: "14:30",
		assignedToTeamMember: mockTeamMembers[2]?.id,
		leadId: mockGeneratedLeads[0]?.id,
		mcpWorkflow: {
			id: "wf_demo_output_001",
			title: "Demo Output Generator",
			prompts: [
				{
					text: "Compile demo assets and final video output.",
					description:
						"Produces downloadable files and an output video on success.",
				},
			],
			functions: [],
			resources: [],
			status: "pending",
		},
		aiState: "success",
		attachments: [
			{ filename: "lead-list.csv", url: "/static/lead-list.csv" },
			{ filename: "requirements.pdf", url: "/static/requirements.pdf" },
			{ filename: "meeting-notes.md", url: "/static/meeting-notes.md" },
		],
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		outputVideoUrl:
			"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
	},
	{
		id: "task_ai_1",
		title: "Generate follow-up email draft",
		description: "Use AI to draft a personalized follow-up email for Morgan.",
		status: "TODO",
		priority: "medium",
		dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
		assignedToTeamMember: mockTeamMembers[3]?.id,
		leadId: mockGeneratedLeads[1]?.id,
		mcpWorkflow: {
			id: "wf_email_001",
			title: "Follow-up Email Generator",
			prompts: [
				{
					text: "Draft a warm follow-up email referencing last conversation and proposing next steps.",
					description:
						"Generates a 2-3 paragraph email tailored to the lead's persona.",
				},
			],
			functions: [],
			resources: [],
			status: "pending",
		},
		aiState: "pending",
		attachments: [
			{ filename: "meeting-notes.md", url: "/static/meeting-notes.md" },
		],
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		outputVideoUrl:
			"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
	},
	{
		id: "task_ai_2",
		title: "Summarize lead notes",
		description:
			"Run AI summary on recent call notes and extract action items.",
		status: "IN_PROGRESS",
		priority: "high",
		dueDate: new Date().toISOString().slice(0, 10),
		assignedToTeamMember: mockTeamMembers[4]?.id,
		leadListId: String(mockLeadListData[1]?.id),
		mcpWorkflow: {
			id: "wf_summary_001",
			title: "Notes Summarizer",
			prompts: [
				{
					text: "Summarize the call notes and list top 5 action items with owners and due dates.",
					description:
						"Produces a concise summary with bullet-point action items.",
				},
			],
			functions: [],
			resources: [],
			status: "pending",
		},
		aiState: "requires_oauth",
		aiMissingParams: ["leadListId"],
		attachments: [{ filename: "lead-list.csv", url: "/static/lead-list.csv" }],
		youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		outputVideoUrl:
			"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
	},
];

export const mockKanbanState: KanbanState = {
	tasks: mockTasks,
	columns: defaultCols,
	draggedTask: null,
};
