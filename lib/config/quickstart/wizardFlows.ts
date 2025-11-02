import type { QuickStartTemplateId } from "./templates";

export type QuickStartPersonaId =
	| "investor"
	| "wholesaler"
	| "lender"
	| "agent";

export interface QuickStartPersonaDefinition {
	readonly id: QuickStartPersonaId;
	readonly title: string;
	readonly headline: string;
	readonly description: string;
}

export type QuickStartGoalId =
	| "investor-pipeline"
	| "investor-market"
	| "wholesaler-dispositions"
	| "wholesaler-acquisitions"
	| "agent-sphere"
	| "agent-expansion"
	| "lender-fund-fast";

export interface QuickStartFlowStepDefinition {
	readonly cardId: string;
	readonly note: string;
}

export interface QuickStartGoalDefinition {
	readonly id: QuickStartGoalId;
	readonly personaId: QuickStartPersonaId;
	readonly title: string;
	readonly description: string;
	readonly outcome: string;
	readonly flow: readonly QuickStartFlowStepDefinition[];
	readonly templateId?: QuickStartTemplateId;
}

const PERSONAS: readonly QuickStartPersonaDefinition[] = [
	{
		id: "investor",
		title: "Investor",
		headline: "Acquire profitable assets faster",
		description:
			"Build repeatable sourcing and outreach loops that keep your pipeline full of motivated sellers.",
	},
	{
		id: "wholesaler",
		title: "Wholesaler",
		headline: "Match deals with ready buyers",
		description:
			"Prioritize high-intent leads, prep them for disposition, and automate buyer follow-up sequences.",
	},
	{
		id: "lender",
		title: "Private Lender",
		headline: "Keep capital deployed and approvals moving",
		description:
			"Route borrowers to the right team instantly and automate the follow-up that closes loans faster.",
	},
	{
		id: "agent",
		title: "Agent / Team",
		headline: "Multiply your listing opportunities",
		description:
			"Blend market intelligence with targeted campaigns so your team captures and nurtures every warm lead.",
	},
] as const;

const GOALS: readonly QuickStartGoalDefinition[] = [
	{
		id: "investor-pipeline",
		personaId: "investor",
		title: "Launch a seller pipeline",
		description:
			"Bring in a fresh list, launch nurture, and sync results back to your systems.",
		outcome: "A ready-to-run outreach play that accelerates new acquisitions.",
		templateId: "lead-import",
		flow: [
			{
				cardId: "import",
				note: "Upload your off-market list or sync a saved search to seed the funnel.",
			},
			{
				cardId: "campaign",
				note: "Create the multi-channel outreach cadence tailored to motivated sellers.",
			},
			{
				cardId: "webhooks",
				note: "Pipe hot responses into your CRM or automations instantly.",
			},
		],
	},
	{
		id: "investor-market",
		personaId: "investor",
		title: "Research a new market",
		description:
			"Model distressed segments, test messaging, and prep for scale.",
		outcome: "Insights-backed lists and campaigns ready for launch.",
		templateId: "market-research",
		flow: [
			{
				cardId: "market-deals",
				note: "Use Market Discovery to pinpoint the right neighborhoods and deal types.",
			},
			{
				cardId: "import",
				note: "Pull the best-fit properties into a working list for enrichment.",
			},
			{
				cardId: "campaign",
				note: "Spin up campaigns that A/B test messaging against those targets.",
			},
		],
	},
	{
		id: "wholesaler-dispositions",
		personaId: "wholesaler",
		title: "Distribute a new contract",
		description:
			"Prep marketing assets and notify premium buyers as soon as a deal is signed.",
		outcome: "Qualified buyers queued with automation-ready messaging.",
		templateId: "campaign-default",
		flow: [
			{
				cardId: "import",
				note: "Import the contracted property list with all relevant details.",
			},
			{
				cardId: "campaign",
				note: "Launch buyer outreach with templated cadences and social proof.",
			},
			{
				cardId: "control-data",
				note: "Monitor responses and export buyer interest for negotiation teams.",
			},
		],
	},
	{
		id: "wholesaler-acquisitions",
		personaId: "wholesaler",
		title: "Source new inventory",
		description:
			"Find distressed opportunities, then capture and nurture sellers.",
		outcome: "Seller conversations ready for assignment or contract.",
		templateId: "campaign-default",
		flow: [
			{
				cardId: "market-deals",
				note: "Search for motivated sellers and absentee owners in target zip codes.",
			},
			{
				cardId: "import",
				note: "Collect and enrich leads that match your buy box.",
			},
			{
				cardId: "campaign",
				note: "Automate outreach sequences to secure appointments quickly.",
			},
		],
	},
	{
		id: "agent-sphere",
		personaId: "agent",
		title: "Nurture your sphere",
		description:
			"Segment homeowners, launch smart follow-up, and keep your pipeline warm.",
		outcome: "Consistent conversations with clients likely to transact soon.",
		templateId: "campaign-default",
		flow: [
			{
				cardId: "market-deals",
				note: "Identify hyper-local trends and homeowners ready for outreach.",
			},
			{
				cardId: "campaign",
				note: "Send omni-channel campaigns that reinforce your brand and offers.",
			},
			{
				cardId: "webhooks",
				note: "Notify your CRM and ISA team as soon as leads engage.",
			},
		],
	},
	{
		id: "agent-expansion",
		personaId: "agent",
		title: "Capture on-site leads",
		description:
			"Equip your team with tools that feed open house and web traffic directly into DealScale.",
		outcome: "Automated lead capture feeding campaigns without manual imports.",
		templateId: "campaign-default",
		flow: [
			{
				cardId: "extension",
				note: "Enable the browser extension so agents capture leads from any portal.",
			},
			{
				cardId: "campaign",
				note: "Drop new contacts into nurture sequences the moment they’re saved.",
			},
			{
				cardId: "control-data",
				note: "Track campaign performance and export reports for your team.",
			},
		],
	},
	{
		id: "lender-fund-fast",
		personaId: "lender",
		title: "Fund deals faster",
		description:
			"Stand up borrower intake flows, automate triage, and alert your capital partners without manual work.",
		outcome:
			"Automation routing keeps borrowers moving from intake to funding.",
		templateId: "automation-routing",
		flow: [
			{
				cardId: "import",
				note: "Ingest borrower requests or referral partner uploads to seed your queue.",
			},
			{
				cardId: "campaign",
				note: "Launch nurture cadences that escalate hot borrowers to loan officers automatically.",
			},
			{
				cardId: "webhooks",
				note: "Sync approvals and stalled deals to downstream systems with event-driven routing.",
			},
		],
	},
] as const;

export const quickStartPersonas = PERSONAS;
export const quickStartGoals = GOALS;

export const getPersonaDefinition = (id: QuickStartPersonaId) =>
	PERSONAS.find((persona) => persona.id === id) ?? null;

export const getGoalDefinition = (id: QuickStartGoalId) =>
	GOALS.find((goal) => goal.id === id) ?? null;

export const getGoalsForPersona = (personaId: QuickStartPersonaId) =>
	GOALS.filter((goal) => goal.personaId === personaId);
