import { z } from "zod";

import type { QuickStartPersonaId } from "@/lib/config/quickstart/wizardFlows";

export type QuickStartCTADisplayMode = "primary" | "secondary" | "both";

const CTA_TITLE_MIN = 10;
const CTA_TITLE_MAX = 48;
const CTA_SUBTITLE_MIN = 8;
const CTA_SUBTITLE_MAX = 90;

const ctaButtonSchema = z.object({
	label: z
		.string()
		.trim()
		.min(
			CTA_TITLE_MIN,
			`CTA title must be at least ${CTA_TITLE_MIN} characters long.`,
		)
		.max(
			CTA_TITLE_MAX,
			`CTA title must be ${CTA_TITLE_MAX} characters or fewer.`,
		),
	ariaLabel: z.string().trim().min(CTA_TITLE_MIN).max(CTA_TITLE_MAX).optional(),
	emphasis: z.enum(["solid", "outline", "ghost"]).default("solid"),
	description: z
		.string()
		.trim()
		.min(
			CTA_SUBTITLE_MIN,
			`CTA subtitle must be at least ${CTA_SUBTITLE_MIN} characters when provided.`,
		)
		.max(
			CTA_SUBTITLE_MAX,
			`CTA subtitle must be ${CTA_SUBTITLE_MAX} characters or fewer.`,
		)
		.optional(),
	badge: z.string().max(24).optional(),
});

const quickStartCTASchema = z.object({
	primary: ctaButtonSchema,
	secondary: ctaButtonSchema.optional(),
	microcopy: z.string().optional(),
});

export type QuickStartCTAConfig = z.infer<typeof quickStartCTASchema>;
export type QuickStartCTAButton = z.infer<typeof ctaButtonSchema>;

type QuickStartCTAKey = QuickStartPersonaId | "default";

const RAW_CTA_COPY: Record<QuickStartCTAKey, QuickStartCTAConfig> = {
	default: {
		primary: {
			label: "Launch My First AI Campaign",
			emphasis: "solid",
			description: "You\u2019re minutes away from your first automated play.",
			badge: "3 min setup",
		},
		secondary: {
			label: "See How QuickStart Works",
			emphasis: "outline",
			description:
				"Watch the guided setup agents, investors, and lenders follow.",
			badge: "1 min demo",
		},
		microcopy: "Stop guessing. QuickStart handles the busywork for you.",
	},
	agent: {
		primary: {
			label: "Start My AI Workflow",
			emphasis: "solid",
			description:
				"Import seller leads, sync your CRM, and see appointments fill in.",
			badge: "4 min process",
		},
		secondary: {
			label: "Watch the 1-Minute Setup Demo",
			emphasis: "outline",
			description: "Preview the guided QuickStart sellers rave about.",
			badge: "Guided tour",
		},
		microcopy:
			'Less chasing. <link href="#automation">More closing</link>. QuickStart keeps every rep on pace.',
	},
	investor: {
		primary: {
			label: "Set Up My First Campaign",
			emphasis: "solid",
			description:
				"Turn raw lists into an AI deal pipeline that surfaces hot sellers.",
			badge: "Deal flow boost",
		},
		secondary: {
			label: "Preview an AI Call Script",
			emphasis: "outline",
			description: "See the outreach sequences that run while you sleep.",
			badge: "Script preview",
		},
		microcopy: "Dealmakers like you do not wait - they automate.",
	},
	wholesaler: {
		primary: {
			label: "Launch My QuickStart",
			emphasis: "solid",
			description:
				"Import skip traced lists and launch AI calls that keep pace.",
			badge: "Skip trace ready",
		},
		secondary: {
			label: "View Onboarding Checklist",
			emphasis: "outline",
			description:
				"See the repeatable steps high-volume wholesalers follow daily.",
			badge: "3 min checklist",
		},
		microcopy: "Keep your buyers and sellers warm while you sleep.",
	},
	loan_officer: {
		primary: {
			label: "Automate Borrower Follow-Up",
			emphasis: "solid",
			description:
				"Connect your mortgage CRM and launch AI nurture in minutes.",
			badge: "Faster approvals",
		},
		secondary: {
			label: "See Mortgage QuickStart in Action",
			emphasis: "outline",
			description: "Watch the borrower journey stay warm from lead to close.",
			badge: "Borrower tour",
		},
		microcopy: "Close loans faster without adding headcount or manual chase.",
	},
};

const CTA_COPY = Object.fromEntries(
	Object.entries(RAW_CTA_COPY).map(([key, definition]) => [
		key,
		quickStartCTASchema.parse(definition),
	]),
) as Record<QuickStartCTAKey, QuickStartCTAConfig>;

export const getQuickStartCTACopy = (
	personaId: QuickStartPersonaId | null | undefined,
): QuickStartCTAConfig => CTA_COPY[personaId ?? "default"] ?? CTA_COPY.default;
