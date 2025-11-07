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
			label: "See How It Works",
			emphasis: "outline",
			description:
				"We\u2019ll walk you through every step in under five minutes.",
			badge: "Watch demo",
		},
		microcopy: "We\u2019ll handle the hard parts; you just click start.",
	},
	agent: {
		primary: {
			label: "Start Closing More, Chasing Less",
			emphasis: "solid",
			description: "Launch your AI follow-ups in under three minutes.",
			badge: "Agents love this",
		},
		secondary: {
			label: "See How Top Agents Scale",
			emphasis: "outline",
			description: "Watch the short walkthrough teams like yours rely on.",
			badge: "Play guided demo",
		},
		microcopy:
			'Less chasing. <link href="#automation">More closing</link>. Your ISA will thank you.',
	},
	investor: {
		primary: {
			label: "Automate My Next Deal",
			emphasis: "solid",
			description: "Never miss a motivated seller again.",
			badge: "Deal flow boost",
		},
		secondary: {
			label: "See How It Works",
			emphasis: "outline",
			description: "See how top investors keep their pipeline warm.",
			badge: "Invest smarter",
		},
		microcopy: "Dealmakers like you don\u2019t wait - they automate.",
	},
	wholesaler: {
		primary: {
			label: "Outwork Everyone - Automatically",
			emphasis: "solid",
			description: "Spin up dispositions without burning out.",
			badge: "Dispo in sync",
		},
		secondary: {
			label: "See the Hustle in Action",
			emphasis: "outline",
			description: "Peek the 3-minute setup wholesalers swear by.",
			badge: "Hands-on demo",
		},
		microcopy: "Keep your buyers and sellers warm while you sleep.",
	},
	lender: {
		primary: {
			label: "Keep My Capital Deployed",
			emphasis: "solid",
			description: "Automate intake and approvals in minutes.",
			badge: "Faster approvals",
		},
		secondary: {
			label: "See the Borrower Flow",
			emphasis: "outline",
			description: "Watch how lenders route borrowers without bottlenecks.",
			badge: "Borrower tour",
		},
		microcopy:
			"We\u2019ll help you close loans faster without adding headcount.",
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
