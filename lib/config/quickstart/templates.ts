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
	readonly salesScriptId?: string;
	readonly daysToRun?: number; // default campaign length in days
	readonly countVoicemailAsAnswered?: boolean;
	readonly voicemailDrops?: boolean;
	readonly campaignGoal?: string;
	readonly voicemailMessageId?: string; // preferred voicemail message preset
	readonly voicemailVoiceId?: string; // preferred voicemail voice preset
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
		primaryChannel: "text",
		workflowId: "wf1",
		salesScriptId: "ss1",
		daysToRun: 7,
		countVoicemailAsAnswered: false,
		voicemailDrops: true,
		campaignGoal: "Warm inbound via SMS to qualify leads after import.",
		voicemailMessageId: "vm_professional",
		voicemailVoiceId: "voice_emma",
		summary: {
			headline:
				"Default SMS outreach is ready the moment you close the wizard.",
			bullets: [
				"Primary channel: Text",
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
		salesScriptId: "ss2",
		daysToRun: 7,
		countVoicemailAsAnswered: true,
		voicemailDrops: true,
		campaignGoal:
			"Call to qualify and book appointments with interested sellers.",
		voicemailMessageId: "vm_urgent",
		voicemailVoiceId: "voice_paul",
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
		primaryChannel: "text",
		workflowId: "wf3",
		salesScriptId: "ss3",
		daysToRun: 7,
		countVoicemailAsAnswered: false,
		voicemailDrops: false,
		campaignGoal: "Collect market signals via SMS to identify hot zips.",
		voicemailMessageId: "vm_friendly",
		voicemailVoiceId: "voice_emma",
		summary: {
			headline:
				"Insights sync automatically to your research workspace via SMS.",
			bullets: [
				"Primary channel: Text",
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
		primaryChannel: "text",
		workflowId: "wf-lender-automation",
		agentId: "42",
		salesScriptId: "ss2",
		daysToRun: 7,
		countVoicemailAsAnswered: false,
		voicemailDrops: false,
		campaignGoal: "Qualify borrowers via SMS and route hot opportunities.",
		voicemailMessageId: "vm_professional",
		voicemailVoiceId: "voice_matthew",
		summary: {
			headline:
				"Automation defaults coordinate borrower intake and funding teams via SMS.",
			bullets: [
				"Primary channel: Text",
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

	// Sales script
	if (template.salesScriptId) {
		store.setSelectedSalesScriptId(template.salesScriptId);
	}

	// Voicemail preferences
	if (typeof template.countVoicemailAsAnswered === "boolean") {
		store.setCountVoicemailAsAnswered(template.countVoicemailAsAnswered);
	}
	if (typeof template.voicemailDrops === "boolean") {
		store.setDoVoicemailDrops(template.voicemailDrops);
	}
	if (template.voicemailMessageId) {
		// @ts-ignore - field present in store
		store.setPreferredVoicemailMessageId(template.voicemailMessageId);
	}
	if (template.voicemailVoiceId) {
		// @ts-ignore - field present in store
		store.setPreferredVoicemailVoiceId(template.voicemailVoiceId);
	}

	// Timing defaults
	const days = template.daysToRun ?? 7;
	store.setDaysSelected(days);
	const start = new Date();
	store.setStartDate(start);
	const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
	store.setEndDate(end);

	// Campaign goal prefill
	if (template.campaignGoal) {
		store.setCampaignGoal(template.campaignGoal);
	}
};
