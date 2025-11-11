"use client";

import { ArrowDown } from "lucide-react";

import {
	DEFAULT_HERO_SOCIAL_PROOF,
	HeroAurora,
	HeroHeadline,
	type HeroVideoConfig,
	HeroVideoPreview,
	resolveHeroCopy,
} from "@external/dynamic-hero";

import PersonaCTA from "@/components/cta/PersonaCTA";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { LightRays } from "@/components/ui/light-rays";
import { Pointer } from "@/components/ui/pointer";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/index";

const LIVE_VIDEO: HeroVideoConfig = {
	src: "https://www.youtube.com/embed/O-3Mxf_kKQc?rel=0&controls=1&modestbranding=1",
	poster:
		"https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1920&auto=format&fit=crop",
	provider: "youtube",
};

const V6_SCHEMA = {
	template:
		"Automate {problem} with AI-powered {solution} — try DealScale free with 5 AI calls before {fear}.",
	persona: {
		problems: [
			"spending hours calling borrowers who never answer",
			"losing track of loan applications across multiple CRM systems",
			"manually following up with pre-approved clients who go cold",
			"juggling borrower outreach, referrals, and realtor relationships without automation",
		],
		solutions: [
			"AI-powered borrower follow-up that runs automatically from your mortgage CRM",
			"automated call, text, and email sequences that keep loan applicants engaged",
			"AI lending assistant that nurtures prospects until they’re ready to close",
			"real-time lead routing and pipeline automation for mortgage teams",
		],
		fears: [
			"competitors capture your pre-approved borrowers first",
			"your pipeline dries up when rates change or leads go cold",
			"realtor partners switch to faster loan officers",
			"you lose repeat borrowers because follow-up slips through the cracks",
		],
	},
	ctas: {
		primary: [
			"Try DealScale Free",
			"Automate My Real Estate Outreach",
			"Launch My First AI Campaign",
			"Start 5 Free AI Calls",
			"Automate Borrower Follow-Up",
		],
		secondary: [
			"See How AI Real Estate Outreach Works",
			"Watch a 1-Minute AI Demo",
			"Take the Quick Start Tour",
			"View Real Estate Case Studies",
			"See Mortgage Automation in Action",
		],
	},
};

const TEMPLATE_PROBLEM = V6_SCHEMA.persona.problems[0];
const TEMPLATE_SOLUTION = V6_SCHEMA.persona.solutions[0];
const TEMPLATE_FEAR = V6_SCHEMA.persona.fears[0];

const LIVE_COPY = resolveHeroCopy(
	{
		values: {
			problem: TEMPLATE_PROBLEM,
			solution: TEMPLATE_SOLUTION,
			fear: TEMPLATE_FEAR,
			socialProof:
				"Loan officers trust DealScale to automate borrower outreach.",
			benefit: "Automate borrower conversations",
			time: "5",
			hope: "Keep borrowers engaged before competitors get there first.",
			headline: V6_SCHEMA.template
				.replace("{problem}", TEMPLATE_PROBLEM)
				.replace("{solution}", TEMPLATE_SOLUTION)
				.replace("{fear}", TEMPLATE_FEAR),
		},
		rotations: {
			problems: V6_SCHEMA.persona.problems,
			solutions: V6_SCHEMA.persona.solutions,
			fears: V6_SCHEMA.persona.fears,
		},
	},
	{
		fallbackPrimaryChip: {
			label: "Loan Officer Persona",
			sublabel: "Mortgage automation",
			variant: "secondary",
		},
		fallbackSecondaryChip: {
			label: "Production Ready",
			variant: "outline",
		},
	},
);

const LIVE_PRIMARY_CTA = {
	label: V6_SCHEMA.ctas.primary[4],
	description: "Put AI borrower follow-up on autopilot with DealScale.",
	emphasis: "solid" as const,
	badge: "Mortgage AI",
};

const LIVE_SECONDARY_CTA = {
	label: V6_SCHEMA.ctas.secondary[4],
	description: "See mortgage automation workflows in a live control center.",
	emphasis: "outline" as const,
	badge: "Live Demo",
};

const LIVE_MICROCOPY =
	'Automate borrower outreach and mortgage follow-up with DealScale AI. <link href="#live-hero-details">Review the rollout steps</link>.';

const LIVE_SOCIAL_PROOF = {
	...DEFAULT_HERO_SOCIAL_PROOF,
	caption: "Reusable hero experiences adopted by DealScale builders.",
};

export default function LiveDynamicHeroDemoPage(): JSX.Element {
	const handleScrollToDetails = () => {
		const section = document.getElementById("live-hero-details");
		if (section) {
			section.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-background/95 text-foreground">
			<LightRays className="pointer-events-none absolute inset-0 opacity-70" />
			<HeroAurora className="z-0" />

			<BackgroundBeamsWithCollision className="relative z-0 flex min-h-screen w-full items-center justify-center pb-20">
				<div className="container relative z-10 mx-auto flex w-full flex-col items-center gap-12 px-4 py-16 md:px-8">
					<div className="flex w-full flex-col items-center gap-4 text-center md:max-w-3xl">
						<div className="flex flex-wrap items-center justify-center gap-3 text-primary text-xs uppercase tracking-[0.35em]">
							<span className="rounded-full border border-foreground/15 bg-foreground/10 px-4 py-1 font-semibold text-foreground/70">
								Loan Officer Hero
							</span>
						</div>

						<div className="relative inline-flex items-center justify-center">
							<button
								type="button"
								onClick={handleScrollToDetails}
								className="group inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 font-semibold text-primary text-xs uppercase tracking-[0.35em] transition hover:bg-primary/15"
							>
								<ArrowDown className="h-3.5 w-3.5 transition group-hover:translate-y-0.5" />
								Next
							</button>
							<Pointer className="text-primary">
								<div className="flex size-9 items-center justify-center rounded-full border border-primary/40 bg-primary/30 text-primary backdrop-blur-md">
									<ArrowDown className="h-4 w-4" />
								</div>
							</Pointer>
						</div>

						<HeroHeadline
							copy={LIVE_COPY}
							socialProof={LIVE_SOCIAL_PROOF}
							reviews={LIVE_SOCIAL_PROOF.reviews}
							personaLabel="Loan Officer Persona"
							personaDescription="AI follow-up for mortgage teams"
						/>
					</div>

					<div className="flex w-full flex-col items-center gap-8">
						<PersonaCTA
							className="w-full"
							displayMode="both"
							orientation="horizontal"
							primary={LIVE_PRIMARY_CTA}
							secondary={LIVE_SECONDARY_CTA}
							microcopy={LIVE_MICROCOPY}
							onPrimaryClick={handleScrollToDetails}
							onSecondaryClick={handleScrollToDetails}
						/>
						<p className="max-w-xl text-center text-muted-foreground text-sm">
							Reusable hero experiences adopted by DealScale builders.
						</p>

						<div className="w-full max-w-5xl" data-beam-collider="true">
							<HeroVideoPreview
								video={LIVE_VIDEO}
								thumbnailAlt="Live dynamic hero video preview"
							/>
						</div>

						<div
							id="live-hero-details"
							className="flex w-full flex-col gap-6 rounded-3xl border border-border/60 bg-background/70 px-6 py-6 shadow-[0_24px_80px_-40px_rgba(34,197,94,0.35)] md:flex-row md:items-center md:justify-between md:px-10 md:py-8"
						>
							<div
								className="flex items-center gap-4"
								data-beam-collider="true"
							>
								<AvatarCircles
									avatarUrls={LIVE_SOCIAL_PROOF.avatars}
									numPeople={LIVE_SOCIAL_PROOF.numPeople}
									interaction="tooltip"
									className="-space-x-3"
								/>
								<div className="text-left">
									<p className="font-semibold text-foreground text-sm">
										Close more loans with always-on borrower follow-up
									</p>
									<p className="text-muted-foreground text-xs">
										Automatically nurture borrowers from first inquiry to
										closing without adding headcount.
									</p>
								</div>
							</div>
							<Separator className="md:hidden" />
							<div className="grid grid-cols-3 gap-4 text-center font-semibold text-foreground text-sm">
								<MetricBlock
									label="Borrower Touchpoints"
									value="5 AI calls free"
								/>
								<MetricBlock
									label="Follow-Up Coverage"
									value="24/7 automation"
								/>
								<MetricBlock
									label="Pipeline Visibility"
									value="Real-time dashboards"
								/>
							</div>
						</div>
					</div>

					<section className="mt-6 max-w-4xl rounded-3xl border border-border/40 bg-muted/40 px-6 py-6 text-muted-foreground text-sm lg:px-10 lg:py-8">
						<p className="leading-relaxed">
							This live demo mirrors the updated Dynamic Hero schema (v6)
							featuring the Loan Officer persona. Rotate through
							mortgage-specific problems, solutions, and fears, launch
							borrower-oriented CTAs, and connect the hero to your mortgage CRM
							using the `@external/dynamic-hero` utilities.
						</p>
					</section>
				</div>
			</BackgroundBeamsWithCollision>
		</div>
	);
}

function MetricBlock({
	label,
	value,
}: {
	label: string;
	value: string;
}): JSX.Element {
	return (
		<div className="flex flex-col items-center gap-2 rounded-2xl border border-border/40 bg-background/80 px-4 py-4 shadow-[0_20px_60px_-30px_rgba(34,197,94,0.45)] backdrop-blur-md">
			<span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
				{label}
			</span>
			+ <span className="text-lg font-semibold text-foreground">{value}</span>
		</div>
	);
}
