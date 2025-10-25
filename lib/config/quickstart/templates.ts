import type { CampaignCreationState } from "@/lib/stores/campaignCreation";

export type QuickStartTemplateId =
	| "lead-import"
	| "campaign-default"
	| "market-research"
	| "automation-routing";

interface QuickStartTemplateSummary {
	readonly headline: string;
	readonly bullets: readonly string[];
}

export interface QuickStartTemplateDefinition {
	readonly id: QuickStartTemplateId;
	readonly label: string;
	readonly campaignName: string;
	readonly primaryChannel: NonNullable<CampaignCreationState["primaryChannel"]>;
	readonly workflowId?: string;
	readonly agentId?: string | null;
	readonly summary: QuickStartTemplateSummary;
}

const TEMPLATE_DEFINITIONS: Record<
	QuickStartTemplateId,
	QuickStartTemplateDefinition
> = {
	"lead-import": {
		id: "lead-import",
		label: "Lead Import Jumpstart",
		campaignName: "Lead Import Launch",
		primaryChannel: "email",
		workflowId: "wf1",
		summary: {
			headline: "Default outreach is ready the moment you close the wizard.",
			bullets: [
				"Primary channel: Email",
				"Workflow: Lead Import Launch",
				"Automation rules: Duplicate guard • Warm lead follow-up",
				"Webhook subscriptions: CRM sync",
			],
		},
	},
	"campaign-default": {
		id: "campaign-default",
		label: "AI Campaign Accelerator",
		campaignName: "AI Outreach Accelerator",
		primaryChannel: "call",
		workflowId: "wf2",
		agentId: "1",
		summary: {
			headline: "Preset cadences combine phone and SMS for rapid follow-up.",
			bullets: [
				"Primary channel: Call",
				"Workflow: AI Outreach Accelerator",
				"Assigned agent: Default dialer",
				"Automation rules: Missed call resurface",
				"Webhook subscriptions: Campaign status feed",
			],
		},
	},
	"market-research": {
		id: "market-research",
		label: "Market Discovery",
		campaignName: "Market Discovery Playbook",
		primaryChannel: "social",
		workflowId: "wf3",
		summary: {
			headline: "Insights sync automatically to your research workspace.",
			bullets: [
				"Primary channel: Social",
				"Workflow: Market Discovery Playbook",
				"Automation rules: Save top performers",
				"Webhook subscriptions: Saved search alerts",
			],
		},
	},
	"automation-routing": {
		id: "automation-routing",
		label: "Borrower Automation Routing",
		campaignName: "Borrower Intake Automation",
		primaryChannel: "email",
		workflowId: "wf-lender-automation",
		agentId: "42",
		summary: {
			headline:
				"Automation defaults coordinate borrower intake and funding teams.",
			bullets: [
				"Primary channel: Email",
				"Workflow: Aggressive: 3-day blitz",
				"Assigned agent: Jane Smith",
				"Automation rules: Hot borrower follow-up • Stalled deal escalation",
				"Webhook subscriptions: Borrower intake",
			],
		},
	},
};

export const getQuickStartTemplate = (id: QuickStartTemplateId) =>
	TEMPLATE_DEFINITIONS[id];

export const applyQuickStartTemplatePreset = (
	templateId: QuickStartTemplateId,
	store: CampaignCreationState,
) => {
	const template = getQuickStartTemplate(templateId);
	if (!template) {
		return;
	}

	store.setCampaignName(template.campaignName);
	store.setPrimaryChannel(template.primaryChannel);
	if (template.workflowId) {
		store.setSelectedWorkflowId(template.workflowId);
	}

	if (typeof template.agentId !== "undefined") {
		store.setSelectedAgentId(template.agentId);
	}
};
