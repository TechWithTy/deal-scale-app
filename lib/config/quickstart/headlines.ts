import { z } from "zod";

import {
	type QuickStartPersonaId,
	getPersonaDefinition,
} from "@/lib/config/quickstart/wizardFlows";
import {
	type HeroCopy,
	type HeroVideoConfig,
	heroChipSchema,
	heroVideoConfigSchema,
	resolveHeroCopy,
} from "@external/dynamic-hero";

const BASE_TITLE_TEMPLATE =
	"Stop {{problem}}, start {{solution}} - before {{fear}}.";
const BASE_SUBTITLE_TEMPLATE =
	"{{socialProof}} {{benefit}} in under {{time}} minutes.";
const DEFAULT_THUMBNAIL_SRC = "/images/quickstart/video-preview.svg";

const headlineValuesSchema = z.object({
	problem: z.string(),
	solution: z.string(),
	fear: z.string(),
	socialProof: z.string(),
	benefit: z.string(),
	time: z.string(),
	hope: z.string().optional(),
});

const headlineRotationsSchema = z.object({
	problems: z.array(z.string()).optional(),
	solutions: z.array(z.string()).optional(),
	fears: z.array(z.string()).optional(),
});

const headlineChipSchema = heroChipSchema;

const headlineCtaSchema = z.object({
	orientation: z.enum(["vertical", "horizontal"]).optional(),
});

const headlineSchema = z.object({
	titleTemplate: z.string().optional(),
	subtitleTemplate: z.string().optional(),
	values: headlineValuesSchema,
	rotations: headlineRotationsSchema.optional(),
	primaryChip: headlineChipSchema.optional(),
	secondaryChip: headlineChipSchema.optional(),
	video: heroVideoConfigSchema.optional(),
	cta: headlineCtaSchema.optional(),
});

export type QuickStartHeadlineCopy = z.infer<typeof headlineSchema>;
export type QuickStartHeadlineValues = z.infer<typeof headlineValuesSchema>;
export type QuickStartHeadlineRotations = z.infer<
	typeof headlineRotationsSchema
>;
export type QuickStartHeadlineChip = z.infer<typeof headlineChipSchema>;
export type QuickStartHeadlineVideo = HeroVideoConfig;
export type QuickStartHeadlineCta = z.infer<typeof headlineCtaSchema>;

type QuickStartHeadlineKey = QuickStartPersonaId | "default";

const PERSONA_VIDEO_LIBRARY: Record<QuickStartHeadlineKey, HeroVideoConfig> = {
	default: {
		src: "https://www.youtube.com/embed/qh3NGpYRG3I?rel=0&controls=1&modestbranding=1&feature=quickstart-overview",
		poster: DEFAULT_THUMBNAIL_SRC,
		provider: "youtube",
	},
	agent: {
		src: "https://www.youtube.com/embed/qh3NGpYRG3I?rel=0&controls=1&modestbranding=1&feature=agent-followup",
		poster: DEFAULT_THUMBNAIL_SRC,
		provider: "youtube",
	},
	investor: {
		src: "https://www.youtube.com/embed/qh3NGpYRG3I?rel=0&controls=1&modestbranding=1&feature=investor-pipeline",
		poster: DEFAULT_THUMBNAIL_SRC,
		provider: "youtube",
	},
	wholesaler: {
		src: "https://www.youtube.com/embed/qh3NGpYRG3I?rel=0&controls=1&modestbranding=1&feature=wholesaler-dispo",
		poster: DEFAULT_THUMBNAIL_SRC,
		provider: "youtube",
	},
	lender: {
		src: "https://www.youtube.com/embed/qh3NGpYRG3I?rel=0&controls=1&modestbranding=1&feature=lender-approvals",
		poster: DEFAULT_THUMBNAIL_SRC,
		provider: "youtube",
	},
};

const RAW_COPY: Record<QuickStartHeadlineKey, QuickStartHeadlineCopy> = {
	default: {
		values: {
			problem: "juggling tools",
			solution: "automating your pipeline",
			fear: "your competitors steal your next deal",
			socialProof: "Join 200+ dealmakers already automating.",
			benefit: "Launch your first AI campaign with DealScale Quick Start",
			time: "5",
			hope: "Give your team back the focus to work the right deals.",
		},
		primaryChip: {
			label: "AI Seller Qualification",
			sublabel: "Lead qualification & appointment setting",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Dealmakers",
			sublabel: "Agents, investors & wholesalers",
			variant: "outline",
		},
		rotations: {
			problems: [
				"juggling tools",
				"wasting hours on follow-ups",
				"losing track of warm leads",
			],
			solutions: [
				"automating your pipeline",
				"closing more deals",
				"syncing every CRM automatically",
			],
			fears: [
				"your competitors steal your next deal",
				"your pipeline goes cold",
				"you fall behind teams scaling with AI",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.default,
		cta: {
			orientation: "horizontal",
		},
	},
	agent: {
		values: {
			problem: "wasting hours on follow-ups",
			solution: "closing more deals",
			fear: "your pipeline goes cold",
			socialProof: "Join 200+ top agents scaling with AI follow-ups.",
			benefit: "Automate your outreach",
			time: "3",
			hope: "Show up in every inbox before your competition does.",
		},
		primaryChip: {
			label: "AI Follow-Up Engine",
			sublabel: "Tasks, scripts, automations",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Agents & Teams",
			sublabel: "ISAs + team leaders",
			variant: "outline",
		},
		rotations: {
			problems: [
				"wasting hours on follow-ups",
				"losing touch with your sphere",
				"copy-pasting scripts late at night",
			],
			solutions: [
				"closing more deals",
				"running AI follow-ups that never sleep",
				"staying top-of-mind automatically",
			],
			fears: [
				"your pipeline goes cold",
				"competitors snag your listings",
				"clients forget why they loved you",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.agent,
	},
	investor: {
		values: {
			problem: "missing motivated sellers",
			solution: "automating deal flow",
			fear: "another profit slips away",
			socialProof: "Trusted by investors keeping their pipeline full.",
			benefit: "Turn missed calls into closed deals",
			time: "5",
			hope: "Keep capital deployed with alerts that surface the right asset.",
		},
		primaryChip: {
			label: "Pipeline Automation",
			sublabel: "Deal flow orchestration",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Investors",
			sublabel: "Acquisition pros",
			variant: "outline",
		},
		rotations: {
			problems: [
				"missing motivated sellers",
				"juggling spreadsheets of hot leads",
				"waiting on manual updates",
			],
			solutions: [
				"automating deal flow",
				"tracking every opportunity in one place",
				"syncing your investment pipeline automatically",
			],
			fears: [
				"another profit slips away",
				"dealmakers swoop in first",
				"you miss the next breakout opportunity",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.investor,
	},
	wholesaler: {
		values: {
			problem: "juggling spreadsheets and CRM chaos",
			solution: "centralizing every lead",
			fear: "your pipeline goes cold overnight",
			socialProof: "Stay ahead of fast-moving buyers and sellers.",
			benefit: "Coordinate dispositions with AI follow-ups",
			time: "4",
			hope: "Keep your buyers hot without adding another coordinator.",
		},
		primaryChip: {
			label: "Acquisition AI",
			sublabel: "Source & dispo faster",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Wholesalers",
			sublabel: "High-volume teams",
			variant: "outline",
		},
		rotations: {
			problems: [
				"juggling spreadsheets and CRM chaos",
				"babysitting every buyer manually",
				"losing track of who bid last",
			],
			solutions: [
				"centralizing every lead",
				"automating dispositions on autopilot",
				"keeping buyers and sellers in sync",
			],
			fears: [
				"your pipeline goes cold overnight",
				"your best buyers forget your deals",
				"competitors lock up inventory first",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.wholesaler,
	},
	lender: {
		values: {
			problem: "letting qualified borrowers wait",
			solution: "automating approvals",
			fear: "your capital sits idle",
			socialProof: "Private lenders trust DealScale to keep capital deployed.",
			benefit: "Route borrowers to the right team",
			time: "6",
			hope: "Keep every borrower warm while the paperwork catches up.",
		},
		subtitleTemplate:
			"{{socialProof}} {{benefit}} in under {{time}} minutes so deals stay funded.",
		primaryChip: {
			label: "Borrower Automation",
			sublabel: "Route & approve faster",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Private Lenders",
			sublabel: "Capital deployment",
			variant: "outline",
		},
		rotations: {
			problems: [
				"letting qualified borrowers wait",
				"drowning in manual intake forms",
				"chasing docs instead of funding loans",
			],
			solutions: [
				"automating approvals",
				"routing borrowers instantly",
				"keeping capital deployed",
			],
			fears: [
				"your capital sits idle",
				"competitors fund the deal first",
				"borrowers look elsewhere for speed",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.lender,
	},
};

const COPY = Object.fromEntries(
	Object.entries(RAW_COPY).map(([key, definition]) => [
		key,
		headlineSchema.parse(definition),
	]),
) as Record<QuickStartHeadlineKey, QuickStartHeadlineCopy>;

export const getQuickStartHeadlineCopy = (
	personaId: QuickStartPersonaId | null | undefined,
) => {
	const key: QuickStartHeadlineKey = personaId ?? "default";
	const raw = COPY[key] ?? COPY.default;
	const titleTemplate = raw.titleTemplate ?? BASE_TITLE_TEMPLATE;
	const subtitleTemplate = raw.subtitleTemplate ?? BASE_SUBTITLE_TEMPLATE;
	const personaDefinition = personaId ? getPersonaDefinition(personaId) : null;

	const heroCopy = resolveHeroCopy(raw, {
		fallbackPrimaryChip: {
			label: "AI Deal Automation",
			sublabel: "Launch in minutes",
			variant: "secondary",
		},
		fallbackSecondaryChip: personaDefinition
			? {
					label: personaDefinition.title,
					variant: "outline",
				}
			: undefined,
	});

	return {
		title: heroCopy.title,
		subtitle: heroCopy.subtitle,
		values: heroCopy.values,
		rotations: heroCopy.rotations,
		chips: {
			primary: heroCopy.chips.primary,
			secondary: heroCopy.chips.secondary,
		},
		video: raw.video,
		cta: raw.cta,
	} as const;
};
