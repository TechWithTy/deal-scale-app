import { z } from "zod";

export const personaSchema = z.union([
	z.literal("investor"),
	z.literal("wholesaler"),
	z.literal("agent"),
]);

export const goalSchema = z.union([
	z.literal("cashflow"),
	z.literal("flip"),
	z.literal("appreciation"),
	z.literal("seller_leads"),
	z.literal("referrals"),
]);

export type Persona = z.infer<typeof personaSchema>;
export type Goal = z.infer<typeof goalSchema>;

const DEFAULT_ZIP = "30301";

const ZIP_MATRIX: Record<Persona, Record<Goal, string>> = {
	investor: {
		cashflow: "78201",
		flip: "19146",
		appreciation: "30309",
		seller_leads: "85032",
		referrals: "33139",
	},
	wholesaler: {
		cashflow: "75216",
		flip: "32209",
		appreciation: "43203",
		seller_leads: "60629",
		referrals: "20707",
	},
	agent: {
		cashflow: "30349",
		flip: "90745",
		appreciation: "98052",
		seller_leads: "11226",
		referrals: "20147",
	},
};

export function suggestZip(persona: Persona, goal: Goal | string): string {
	const safePersona = personaSchema.parse(persona);
	const parsedGoal = goalSchema.safeParse(goal);
	if (!parsedGoal.success) return DEFAULT_ZIP;
	return ZIP_MATRIX[safePersona][parsedGoal.data] ?? DEFAULT_ZIP;
}

export interface SuggestionResult {
	persona: Persona;
	goal?: Goal;
	zip: string;
	message: string;
}

export function deriveSuggestion(
	personaInput: Persona | string,
	goalInput: Goal | string,
): SuggestionResult {
	const parsedPersona = personaSchema.safeParse(personaInput);
	const personaValue: Persona = parsedPersona.success
		? parsedPersona.data
		: "investor";

	const parsedGoal = goalSchema.safeParse(goalInput);
	const goalValue = parsedGoal.success ? parsedGoal.data : undefined;

	const zip = goalValue ? ZIP_MATRIX[personaValue][goalValue] : DEFAULT_ZIP;

	const personaMeta = PERSONA_OPTIONS.find(
		(option) => option.value === personaValue,
	);
	const goalMeta = goalValue
		? GOAL_OPTIONS.find((option) => option.value === goalValue)
		: undefined;

	const personaTitle = personaMeta?.title ?? personaValue;
	const goalLabel = goalMeta?.label ?? "Balanced Growth";

	const message = `${personaTitle}s targeting ${goalLabel.toLowerCase()} perform well around ${zip}. Apply this zip to align comps with similar deals.`;

	return {
		persona: personaValue,
		goal: goalValue,
		zip,
		message,
	};
}

export const PERSONA_OPTIONS: Array<{
	value: Persona;
	title: string;
	description: string;
}> = [
	{
		value: "investor",
		title: "Investor",
		description: "Optimize cap rates and appreciation trends",
	},
	{
		value: "wholesaler",
		title: "Wholesaler",
		description: "Source motivated sellers and quick dispositions",
	},
	{
		value: "agent",
		title: "Agent",
		description: "Expand referral-rich farming neighborhoods",
	},
];

export const GOAL_OPTIONS: Array<{
	value: Goal;
	label: string;
}> = [
	{ value: "cashflow", label: "Cash Flow" },
	{ value: "flip", label: "Fix & Flip" },
	{ value: "appreciation", label: "Appreciation" },
	{ value: "seller_leads", label: "Seller Leads" },
	{ value: "referrals", label: "Referral Network" },
];
