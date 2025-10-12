export type PlatformAdminPlanPriority = "Critical" | "High" | "Medium";
export type PlatformAdminPlanStatus = "To Do" | "In Progress" | "Done";

export interface PlatformAdminPlanItem {
	userStory: string;
	epic: string;
	sprint: string;
	priority: PlatformAdminPlanPriority;
	status: PlatformAdminPlanStatus;
	storyPoints: number;
	acceptanceCriteria: readonly string[];
}

type FrozenPlanItem = Readonly<PlatformAdminPlanItem>;

type FrozenPlan = ReadonlyArray<FrozenPlanItem>;

const SOURCE_PLAN: PlatformAdminPlanItem[] = [
	{
		userStory:
			"As a developer, I need to create a role-aware admin layout, so that admin pages are secure and context-aware.",
		epic: "Platform Admin (Frontend)",
		sprint: "Sprint 1",
		priority: "Critical",
		status: "To Do",
		storyPoints: 8,
		acceptanceCriteria: [
			"Scenario: Access Admin Section",
			"Given a user's JWT contains a 'role' claim ('support' or 'admin')",
			"When I navigate to any URL under the /admin/** path",
			"Then a dedicated admin layout is rendered, separate from the main app layout.",
			"And if my role is 'user', I am redirected to the main dashboard.",
		],
	},
	{
		userStory:
			"As a Support Agent, I want to search for users by email, so that I can access their profile to begin troubleshooting.",
		epic: "Platform Admin (Frontend)",
		sprint: "Sprint 1",
		priority: "High",
		status: "To Do",
		storyPoints: 5,
		acceptanceCriteria: [
			"Scenario: Find and View a User",
			"Given I am on the main /admin dashboard",
			"When I type an email into a Shadcn <Input> with a search button",
			"Then an API call is made to /api/v1/admin/users/search on submit.",
			"And I am navigated to a user detail page (/admin/users/{id}) that displays their profile info and credit balances.",
		],
	},
	{
		userStory:
			"As a Support Agent, I want to use a modal to adjust a user's credits, so that I can quickly resolve billing or service issues.",
		epic: "Platform Admin (Frontend)",
		sprint: "Sprint 2",
		priority: "High",
		status: "To Do",
		storyPoints: 5,
		acceptanceCriteria: [
			"Scenario: Adjust Credits via Modal",
			"Given I am on a user detail page",
			'When I click the "Adjust Credits" <Button>',
			"Then a Shadcn <Dialog> appears with a form built with React Hook Form.",
			"And I can select a credit type, enter an amount (positive or negative), and type a reason.",
			"Upon submission, the API is called, the modal closes, and the user's credit balance on the page updates.",
		],
	},
	{
		userStory:
			"As a Support Agent, I want to click a button to retry a failed N8N provisioning, so that I can easily fix a user's onboarding problem.",
		epic: "Platform Admin (Frontend)",
		sprint: "Sprint 2",
		priority: "High",
		status: "To Do",
		storyPoints: 3,
		acceptanceCriteria: [
			"Scenario: Retry Provisioning",
			"Given I am on a user detail page and their GHL status is 'failed'",
			'When I click the "Retry Provisioning" <Button>',
			"And I confirm the action in a Shadcn <AlertDialog>",
			"Then an API call is made to /api/v1/admin/users/{userId}/retry-provisioning and a success <Toast> is shown.",
		],
	},
	{
		userStory:
			"As a Platform Admin, I want to impersonate a user, so that I can experience the app from their perspective to debug complex issues.",
		epic: "Platform Admin (Frontend)",
		sprint: "Sprint 3",
		priority: "High",
		status: "To Do",
		storyPoints: 8,
		acceptanceCriteria: [
			"Scenario: User Impersonation Flow",
			"Given I am logged in with an 'admin' role on a user detail page",
			'When I click the "Impersonate" <Button>',
			"Then the app stores my original admin JWT in Zustand, uses the temporary user JWT returned by the API, and redirects to the main user dashboard.",
			'And a persistent banner is displayed at the top of the screen reading "Impersonating [User Name] - End Session" which, when clicked, restores my admin session.',
		],
	},
	{
		userStory:
			"As a Support Agent, I want to view a clean, human-readable log of a user's recent activity, so that I can quickly understand their journey.",
		epic: "Platform Admin (Frontend)",
		sprint: "Sprint 3",
		priority: "Medium",
		status: "To Do",
		storyPoints: 5,
		acceptanceCriteria: [
			"Scenario: View User Activity Stream",
			"Given I am on a user detail page",
			'When I click the "Activity Log" tab',
			"Then an API call is made to /api/v1/admin/users/{userId}/logs",
			'And the returned events are displayed in a formatted list or table with timestamps and clear descriptions (e.g., "Admin [Admin Name] granted 100 AI Credits").',
		],
	},
] satisfies PlatformAdminPlanItem[];

const FROZEN_PLAN: FrozenPlan = Object.freeze(
	SOURCE_PLAN.map(
		(item) =>
			Object.freeze({
				...item,
				acceptanceCriteria: Object.freeze([...item.acceptanceCriteria]),
			}) as FrozenPlanItem,
	),
);

export type PlatformAdminPlan = FrozenPlan;

export function createPlatformAdminPlan(): PlatformAdminPlan {
	return FROZEN_PLAN;
}
