import type { CampaignCreationState } from "@/lib/stores/campaignCreation";

export type QuickStartTemplateId =
	| "lead-import"
	| "campaign-default"
	| "market-research";

interface QuickStartTemplateDefinition {
	readonly id: QuickStartTemplateId;
	readonly label: string;
	readonly campaignName: string;
	readonly primaryChannel: NonNullable<CampaignCreationState["primaryChannel"]>;
	readonly workflowId?: string;
	readonly agentId?: string | null;
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
	},
	"campaign-default": {
		id: "campaign-default",
		label: "AI Campaign Accelerator",
		campaignName: "AI Outreach Accelerator",
		primaryChannel: "call",
		workflowId: "wf2",
		agentId: "1",
	},
	"market-research": {
		id: "market-research",
		label: "Market Discovery",
		campaignName: "Market Discovery Playbook",
		primaryChannel: "social",
		workflowId: "wf3",
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
