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
	"Stop {{problem}}, start {{solution}} - before {{fear}}. Imagine {{hope}}.";
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
	hopes: z.array(z.string()).optional(),
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

const DEMO_SUPADEMO_SRC =
	"https://app.supademo.com/embed/cmhjlwt7i0jk4u1hm0scmf39w?embed_v=2&panel=false&autoplay=1&loop=1";
const DEMO_POSTER_WEBP = "/demos/svgs/JZP1_tcJNyZaQHtc8ZL9p.webp";

const PERSONA_VIDEO_LIBRARY: Record<QuickStartHeadlineKey, HeroVideoConfig> = {
	default: {
		src: DEMO_SUPADEMO_SRC,
		poster: DEMO_POSTER_WEBP,
		thumbnailVideo: "/demos/gifs/SVGv2r.mp4",
		posterAlt: "Watch DealScale QuickStart automate onboarding",
		provider: "supademo",
	},
	agent: {
		src: DEMO_SUPADEMO_SRC,
		poster: DEMO_POSTER_WEBP,
		thumbnailVideo: "/demos/gifs/SVGv2r.mp4",
		posterAlt: "Agent QuickStart guided workflow preview",
		provider: "supademo",
	},
	investor: {
		src: DEMO_SUPADEMO_SRC,
		poster: DEMO_POSTER_WEBP,
		thumbnailVideo: "/demos/gifs/SVGv2r.mp4",
		posterAlt: "Investor QuickStart guided workflow preview",
		provider: "supademo",
	},
	wholesaler: {
		src: DEMO_SUPADEMO_SRC,
		poster: DEMO_POSTER_WEBP,
		thumbnailVideo: "/demos/gifs/SVGv2r.mp4",
		posterAlt: "Wholesaler QuickStart guided workflow preview",
		provider: "supademo",
	},
	loan_officer: {
		src: DEMO_SUPADEMO_SRC,
		poster: DEMO_POSTER_WEBP,
		thumbnailVideo: "/demos/gifs/SVGv2r.mp4",
		posterAlt: "Loan officer QuickStart borrower automation demo",
		provider: "supademo",
	},
};

const RAW_COPY: Record<QuickStartHeadlineKey, QuickStartHeadlineCopy> = {
	default: {
		values: {
			problem: "wasting hours setting up campaigns",
			solution: "launching AI QuickStarts that sync your CRM",
			fear: "competitors follow up faster",
			socialProof: "Join 200+ teams launching DealScale QuickStart each month.",
			benefit: "Kick off automation-ready onboarding with zero guesswork",
			time: "5",
			hope: "waking up to appointments already queued for you",
		},
		primaryChip: {
			label: "AI QuickStart",
			sublabel: "Guided onboarding flows",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Revenue Teams",
			sublabel: "Agents, investors, lenders",
			variant: "outline",
		},
		rotations: {
			problems: [
				"wasting hours setting up campaigns",
				"rebuilding playbooks for every new persona",
				"juggling CRMs, dialers, and spreadsheets",
			],
			solutions: [
				"launching AI QuickStarts that sync your CRM",
				"importing leads and going live in minutes",
				"running nurture that scores seller leads automatically",
			],
			fears: [
				"competitors follow up faster",
				"AI tools gather dust on the shelf",
				"hot leads slip to teams with cleaner systems",
			],
			hopes: [
				"waking up to appointments already queued for you",
				"seeing new pipeline activity every morning",
				"finally trusting automation to work the right leads",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.default,
		cta: {
			orientation: "horizontal",
		},
	},
	agent: {
		values: {
			problem: "setting up real estate campaigns from scratch every time",
			solution:
				"a QuickStart that imports leads and syncs with your CRM in minutes",
			fear: "you keep guessing instead of working your best opportunities",
			socialProof:
				"Top agents across 200+ markets rely on DealScale QuickStart.",
			benefit: "Deploy AI seller scoring and follow-up that books listings",
			time: "4",
			hope: "your AI pipeline runs while you focus on clients",
		},
		primaryChip: {
			label: "Agent QuickStart",
			sublabel: "Listing appointment engine",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Seller Leads",
			sublabel: "CRM synced outreach",
			variant: "outline",
		},
		rotations: {
			problems: [
				"setting up real estate campaigns from scratch every time",
				"not knowing which seller leads to call first",
				"wasting hours trying to connect dialers, CRMs, and spreadsheets",
			],
			solutions: [
				"a QuickStart that imports leads and syncs with your CRM in minutes",
				"AI real estate lead scoring that surfaces your hottest seller leads",
				"prebuilt AI follow-up campaigns tailored for listing appointments",
			],
			fears: [
				"you keep guessing instead of working your best opportunities",
				"your AI tools never get fully set up and just sit on the shelf",
				"competitors with cleaner systems follow up faster than you do",
			],
			hopes: [
				"your AI pipeline runs while you focus on clients",
				"every morning you see new appointments ready to confirm",
				"your outreach finally feels automatic and consistent",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.agent,
	},
	investor: {
		values: {
			problem: "spending hours organizing seller lists before outreach",
			solution:
				"a QuickStart workflow that turns raw lists into an organized AI deal pipeline",
			fear: "you miss off-market deals because setup takes too long",
			socialProof:
				"Investors automate acquisitions with DealScale QuickStart in every major market.",
			benefit: "Stand up an AI deal pipeline that flags high intent sellers",
			time: "5",
			hope: "you discover new deals while sleeping",
		},
		primaryChip: {
			label: "Investor QuickStart",
			sublabel: "AI deal pipeline",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Deal Flow",
			sublabel: "Acquisitions automation",
			variant: "outline",
		},
		rotations: {
			problems: [
				"spending hours organizing seller lists before outreach",
				"not having a clear real estate deal pipeline across markets and lists",
				"manually deciding which motivated sellers to call or text first",
			],
			solutions: [
				"a QuickStart workflow that turns raw lists into an organized AI deal pipeline",
				"AI lead intelligence that flags high-intent sellers automatically",
				"an AI call and SMS sequence that runs your acquisitions outreach for you",
			],
			fears: [
				"you miss off-market deals because setup takes too long",
				"your acquisitions system never scales past your own effort",
				"you leave profit on the table each month from unworked leads",
			],
			hopes: [
				"you discover new deals while sleeping",
				"your acquisitions engine runs itself across multiple markets",
				"you finally focus on negotiations, not admin",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.investor,
	},
	wholesaler: {
		values: {
			problem:
				"spending nights organizing skip traced lists instead of closing deals",
			solution:
				"a QuickStart that imports skip traced lists and launches AI calls instantly",
			fear: "your new lists go stale before you can work them",
			socialProof:
				"Wholesalers across 40+ metros run dispositions on DealScale automation.",
			benefit: "Launch AI seller and buyer follow-up without manual effort",
			time: "4",
			hope: "you lock up new deals daily while AI handles follow-up",
		},
		primaryChip: {
			label: "Wholesaler QuickStart",
			sublabel: "Acquisitions autopilot",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Skip Trace Ready",
			sublabel: "Seller + buyer outreach",
			variant: "outline",
		},
		rotations: {
			problems: [
				"spending nights organizing skip traced lists instead of closing deals",
				"not having a repeatable system to launch seller outreach quickly",
				"losing momentum every time you buy a new list",
			],
			solutions: [
				"a QuickStart that imports skip traced lists and launches AI calls instantly",
				"prebuilt AI wholesaling campaigns tuned for motivated sellers",
				"automatic follow-up that keeps you in front of sellers until they are ready",
			],
			fears: [
				"your new lists go stale before you can work them",
				"you stay stuck in one-person hustle mode instead of building a system",
				"other wholesalers with better automation lock up your best deals",
			],
			hopes: [
				"you lock up new deals daily while AI handles follow-up",
				"your CRM updates itself as sellers respond",
				"you scale from hustler to business owner effortlessly",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.wholesaler,
	},
	loan_officer: {
		values: {
			problem: "spending hours calling borrowers who never respond",
			solution:
				"a QuickStart that connects your mortgage CRM and automates borrower outreach",
			fear: "borrowers lose interest before you can reach them",
			socialProof:
				"Loan officers keep pipelines warm with DealScale borrower automation.",
			benefit: "Sync CRM, launch AI nurture, and stay first to close",
			time: "6",
			hope: "borrowers stay engaged from pre-approval to close",
		},
		subtitleTemplate:
			"{{socialProof}} {{benefit}} in under {{time}} minutes so every borrower stays on track.",
		primaryChip: {
			label: "Borrower QuickStart",
			sublabel: "Mortgage automation layer",
			variant: "secondary",
		},
		secondaryChip: {
			label: "Loan Officers",
			sublabel: "Pipeline automation",
			variant: "outline",
		},
		rotations: {
			problems: [
				"spending hours calling borrowers who never respond",
				"forgetting to follow up with warm pre-approved clients",
				"manually tracking loan application updates across multiple systems",
			],
			solutions: [
				"a QuickStart that connects your mortgage CRM and automates borrower outreach",
				"AI-powered call and text sequences that nurture applicants automatically",
				"real-time borrower engagement dashboards that update themselves",
			],
			fears: [
				"borrowers lose interest before you can reach them",
				"competitors close faster and capture your pipeline",
				"you lose repeat business because follow-ups fall through",
			],
			hopes: [
				"borrowers stay engaged from pre-approval to close",
				"AI keeps your pipeline full while you focus on relationships",
				"you hit new closing records without longer hours",
			],
		},
		video: PERSONA_VIDEO_LIBRARY.loan_officer,
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
