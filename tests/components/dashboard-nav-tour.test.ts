import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const dashboardNavPath = path.join(root, "components", "dashboard-nav.tsx");
const dashboardRoutesPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"tour",
	"tours",
	"dashboardRoutes.ts",
);
const aiAgentsManagerPath = path.join(
	root,
	"components",
	"aiAgents",
	"index.tsx",
);
const aiAgentsListPath = path.join(
	root,
	"components",
	"aiAgents",
	"AgentList.tsx",
);
const agentFormPath = path.join(
	root,
	"components",
	"forms",
	"agent",
	"AgentForm.tsx",
);
const agentDetailsFormPath = path.join(
	root,
	"components",
	"forms",
	"agent",
	"AgentDetailsForm.tsx",
);
const appTourProviderPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"tour",
	"AppTourProvider.tsx",
);
const tourHelpersPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"tour",
	"tourHelpers.ts",
);
const campaignTablePath = path.join(
	root,
	"components",
	"campaigns",
	"utils",
	"campaignTable.tsx",
);
const campaignTourModalHookPath = path.join(
	root,
	"components",
	"campaigns",
	"utils",
	"useCampaignTourModal.ts",
);
const campaignModalPath = path.join(
	root,
	"external",
	"shadcn-table",
	"src",
	"examples",
	"campaigns",
	"modal",
	"CampaignModalMain.tsx",
);
const campaignModalStepsPath = path.join(
	root,
	"external",
	"shadcn-table",
	"src",
	"examples",
	"campaigns",
	"modal",
	"steps",
);
const chatPagePath = path.join(root, "app", "dashboard", "chat", "page.tsx");
const chatShellPath = path.join(
	root,
	"components",
	"home",
	"submodule-chat-shell.tsx",
);
const submoduleSidebarPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"Sidebar.tsx",
);
const submoduleSidebarHeaderPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"Sidebar",
	"SidebarHeaderSection.tsx",
);
const submoduleApplicationsStarterPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"Sidebar",
	"ApplicationsStarter.tsx",
);
const submoduleChatInputPath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"ChatInput.tsx",
);
const submoduleSlashCommandPalettePath = path.join(
	root,
	"external",
	"interactive-avatar-nextjs-demo",
	"components",
	"AvatarSession",
	"chat",
	"SlashCommandPalette.tsx",
);
const leadsDemoTablePath = path.join(
	root,
	"external",
	"shadcn-table",
	"src",
	"examples",
	"Lead",
	"LeadsDemoTable.tsx",
);
const kanbanTaskDialogPath = path.join(
	root,
	"external",
	"kanban",
	"components",
	"EditTaskDialog.tsx",
);
const newTaskDialogPath = path.join(root, "external", "new-task-dialog.tsx");
const connectionsPagePath = path.join(
	root,
	"app",
	"dashboard",
	"connections",
	"page.tsx",
);
const webhookModalPath = path.join(
	root,
	"components",
	"reusables",
	"modals",
	"user",
	"webhooks",
	"WebHookMain.tsx",
);
const resourceSectionPaths = [
	path.join(root, "components", "resources", "TrainingVideosSection.tsx"),
	path.join(root, "components", "resources", "CustomGPTsSection.tsx"),
	path.join(root, "components", "resources", "SimulationsSection.tsx"),
	path.join(root, "components", "resources", "MentorsSection.tsx"),
] as const;

const routeTours = [
	{ exportName: "agentManagerTour", href: "/dashboard/agents" },
	{ exportName: "campaignsTour", href: "/dashboard/campaigns" },
	{ exportName: "leadListTour", href: "/dashboard/lead-list" },
	{ exportName: "kanbanTour", href: "/dashboard/kanban" },
	{ exportName: "chatTour", href: "/dashboard/chat" },
	{ exportName: "connectionsTour", href: "/dashboard/connections" },
	{ exportName: "chartsTour", href: "/dashboard/charts" },
	{ exportName: "calculationsTour", href: "/dashboard/calculators" },
	{ exportName: "resourcesTour", href: "/dashboard/resources" },
	{ exportName: "dealRoomTour", href: "/dashboard/deal-room" },
	{ exportName: "employeeTour", href: "/dashboard/employee" },
] as const;

describe("DashboardNav tour launchers", () => {
	it("exposes app tour launch buttons for dashboard sidebar pages", () => {
		const source = readFileSync(dashboardNavPath, "utf8");

		expect(source).toContain("data-tour-sidebar-launch");
		expect(source).toContain("startRouteTour(helpTour.href, helpTour.tourId)");
		expect(source).toContain("router.push(href)");
		expect(source).toContain("pendingTour");
		expect(source).toContain("if (!isMinimized)");
		expect(source).not.toContain("TooltipProvider");
		expect(source).not.toContain('className="contents"');

		for (const [href, tourId] of [
			["/dashboard/agents", "agent-manager"],
			["/dashboard/campaigns", "campaigns"],
			["/dashboard/lead-list", "lead-list"],
			["/dashboard/kanban", "kanban"],
			["/dashboard/chat", "chat"],
			["/dashboard/connections", "connections"],
			["/dashboard/charts", "charts"],
			["/dashboard/calculators", "calculations"],
			["/dashboard/resources", "resources"],
			["/dashboard/deal-room", "deal-room"],
			["/dashboard/employee", "employee"],
		]) {
			expect(source).toContain(`"${href}": "${tourId}"`);
		}
	});

	it("keeps dashboard route tours multi-step and navigable", () => {
		const source = readFileSync(dashboardRoutesPath, "utf8");

		expect(source).toContain("openDashboardTourTarget(href, target)");

		for (const { exportName, href } of routeTours) {
			const start = source.indexOf(`export const ${exportName}`);
			const nextExport = source.indexOf("\nexport const ", start + 1);
			const block = source.slice(
				start,
				nextExport === -1 ? source.length : nextExport,
			);

			expect(start, exportName).toBeGreaterThanOrEqual(0);
			expect(block.match(/dashboardRouteStep\(/g)?.length ?? 0).toBeGreaterThan(
				1,
			);
			expect(block).toContain(`href: "${href}"`);
		}
	});

	it("opens the campaign builder and tours its creation steps", () => {
		const dashboardRoutesSource = readFileSync(dashboardRoutesPath, "utf8");
		const tourHelpersSource = readFileSync(tourHelpersPath, "utf8");
		const campaignTableSource = readFileSync(campaignTablePath, "utf8");
		const campaignTourModalHookSource = readFileSync(
			campaignTourModalHookPath,
			"utf8",
		);
		const campaignModalSource = readFileSync(campaignModalPath, "utf8");
		const campaignStepSources = [
			"ChannelSelectionStep.tsx",
			"ChannelCustomizationStep.tsx",
			"TimingPreferencesStep.tsx",
			"FinalizeCampaignStep.tsx",
		]
			.map((fileName) =>
				readFileSync(path.join(campaignModalStepsPath, fileName), "utf8"),
			)
			.join("\n");

		for (const target of [
			'data-tour="campaign-channel-step"',
			'data-tour="campaign-customization-step"',
			'data-tour="campaign-timing-step"',
			'data-tour="campaign-finalize-step"',
		]) {
			expect(campaignStepSources).toContain(target);
			expect(dashboardRoutesSource).toContain(target.replace("data-tour=", ""));
		}

		expect(dashboardRoutesSource).toContain("openCampaignCreateTarget");
		expect(tourHelpersSource).toContain("tour-open-campaign-create-modal");
		expect(tourHelpersSource).toContain("tour-set-campaign-create-step");
		expect(campaignTableSource).toContain("useCampaignTourModal");
		expect(campaignTourModalHookSource).toContain(
			"tour-open-campaign-create-modal",
		);
		expect(campaignModalSource).toContain("tour-set-campaign-create-step");
	});

	it("adds detailed visible steps across dashboard sidebar routes", () => {
		const source = readFileSync(dashboardRoutesPath, "utf8");

		for (const target of [
			'[data-tour="campaigns-header"]',
			'[data-tour="sidebar-header"]',
			'[data-tour="top-panel-tabs"]',
			'[data-tour="connections-header"]',
			'[data-tour="charts-header"]',
			'[data-tour="charts-roi-calculator"]',
			'[data-tour="calculations-header"]',
			'[data-tour="calculations-hub"]',
			'[data-tour="deal-room-header"]',
			'[data-tour="employee-header"]',
		]) {
			expect(source).toContain(`target: '${target}'`);
		}
	});

	it("targets concrete AI agent controls during the guided tour", () => {
		const dashboardRoutesSource = readFileSync(dashboardRoutesPath, "utf8");
		const sourceByTarget = [
			readFileSync(aiAgentsManagerPath, "utf8"),
			readFileSync(aiAgentsListPath, "utf8"),
			readFileSync(agentFormPath, "utf8"),
			readFileSync(agentDetailsFormPath, "utf8"),
		].join("\n");

		for (const target of [
			"agent-manager-name-control",
			"agent-manager-type-control",
			"agent-manager-goal-control",
			"agent-manager-persona-control",
			"agent-manager-script-control",
			"agent-manager-script-upload-control",
			"agent-manager-save-control",
			"agents-table-control",
		]) {
			expect(dashboardRoutesSource).toContain(`[data-tour="${target}"]`);
			expect(sourceByTarget).toContain(`data-tour="${target}"`);
		}

		for (const oldTarget of [
			"target: '[data-tour=\"agent-manager-name\"]'",
			"target: '[data-tour=\"agent-manager-type\"]'",
			"target: '[data-tour=\"agent-manager-goal\"]'",
			"target: '[data-tour=\"agent-manager-persona\"]'",
			"target: '[data-tour=\"agent-manager-script\"]'",
			"target: '[data-tour=\"agent-manager-script-upload\"]'",
			"target: '[data-tour=\"agent-manager-save\"]'",
			"target: '[data-tour=\"agents-table\"]'",
		]) {
			expect(dashboardRoutesSource).not.toContain(oldTarget);
		}
	});

	it("keeps campaign modal tour steps from blocking modal controls", () => {
		const providerSource = readFileSync(appTourProviderPath, "utf8");
		const dashboardRoutesSource = readFileSync(dashboardRoutesPath, "utf8");

		expect(providerSource).toContain("activeStep.hideOverlay ? null");

		for (const target of [
			'[data-tour="campaign-channel-step"]',
			'[data-tour="campaign-customization-step"]',
			'[data-tour="campaign-timing-step"]',
			'[data-tour="campaign-finalize-step"]',
		]) {
			const targetIndex = dashboardRoutesSource.indexOf(`target: '${target}'`);
			const stepBlock = dashboardRoutesSource.slice(
				targetIndex,
				targetIndex + 300,
			);

			expect(targetIndex, target).toBeGreaterThanOrEqual(0);
			expect(stepBlock).toContain("hideOverlay: true");
		}
	});

	it("covers the formerly shallow sidebar route functionality", () => {
		const dashboardRoutesSource = readFileSync(dashboardRoutesPath, "utf8");
		const tourHelpersSource = readFileSync(tourHelpersPath, "utf8");
		const sourceByTarget = [
			readFileSync(chatPagePath, "utf8"),
			readFileSync(chatShellPath, "utf8"),
			readFileSync(submoduleSidebarPath, "utf8"),
			readFileSync(submoduleSidebarHeaderPath, "utf8"),
			readFileSync(submoduleApplicationsStarterPath, "utf8"),
			readFileSync(submoduleChatInputPath, "utf8"),
			readFileSync(submoduleSlashCommandPalettePath, "utf8"),
			readFileSync(leadsDemoTablePath, "utf8"),
			readFileSync(kanbanTaskDialogPath, "utf8"),
			readFileSync(newTaskDialogPath, "utf8"),
			readFileSync(connectionsPagePath, "utf8"),
			readFileSync(webhookModalPath, "utf8"),
			...resourceSectionPaths.map((filePath) => readFileSync(filePath, "utf8")),
		].join("\n");

		for (const target of [
			"lead-list-workspace-header",
			"lead-list-search",
			"lead-list-ai-actions",
			"lead-list-actions",
			"lead-list-data-table",
			"kanban-manual-task-button",
			"kanban-ai-task-button",
			"kanban-task-type",
			"kanban-task-assignment",
			"kanban-manual-task-form",
			"kanban-ai-task-form",
			"kanban-ai-preview",
			"kanban-task-save",
			"sidebar-header",
			"search-conversations",
			"new-chat",
			"bookmark-current",
			"chats-section",
			"bookmarks",
			"knowledge-base",
			"tools",
			"agents",
			"app-tours",
			"top-panel-tabs",
			"brain-tab",
			"data-tab",
			"actions-tab",
			"chat-input",
			"slash-command-menu",
			"slash-command-item",
			"connections-configure",
			"connections-highlights",
			"connections-webhook-modal",
			"connections-webhook-categories",
			"connections-crm-guides",
			"connections-webhook-stages",
			"connections-webhook-url",
			"connections-webhook-payload",
			"connections-webhook-history",
			"connections-webhook-actions",
			"resources-training-card",
			"resources-training-open",
			"resources-gpt-card",
			"resources-gpt-open",
			"resources-simulation-card",
			"resources-simulation-discord",
			"resources-discord-cta",
			"resources-mentor-card",
			"resources-mentor-contact",
			"resources-mentorship-info",
		]) {
			expect(sourceByTarget).toContain(target);
			expect(dashboardRoutesSource).toContain(`[data-tour="${target}"]`);
		}

		expect(tourHelpersSource).toContain("openDashboardKanbanTaskTarget");
		expect(tourHelpersSource).toContain("openConnectionsWebhookTarget");
		expect(tourHelpersSource).toContain("openAppToursSection");
		expect(tourHelpersSource).toContain("openSidebarSection");
		expect(tourHelpersSource).toContain("openTopPanel");
		expect(tourHelpersSource).toContain("openSlashCommandMenu");
	});
});
