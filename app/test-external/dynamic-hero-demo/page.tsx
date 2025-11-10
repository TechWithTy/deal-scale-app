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

const MOCK_VIDEO: HeroVideoConfig = {
	src: "https://www.youtube.com/embed/qh3NGpYRG3I?rel=0&controls=1&modestbranding=1",
	poster:
		"https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop",
	provider: "youtube",
};

const MOCK_COPY = resolveHeroCopy(
	{
		values: {
			problem: "manually stitching hero sections",
			solution: "reusing shared UI modules",
			fear: "launch delays creep in",
			socialProof: "Join 200+ teams speeding up delivery.",
			benefit: "Ship dynamic marketing pages",
			time: "7",
		},
		rotations: {
			problems: [
				"manually stitching hero sections",
				"babysitting inconsistent brand tokens",
				"copying animations from five codebases",
			],
			solutions: [
				"reusing shared UI modules",
				"dropping in synced motion presets",
				"launching personas from one package",
			],
			fears: [
				"launch delays creep in",
				"stakeholders churn on stale demos",
				"brand QA turns into fire drills",
			],
		},
	},
	{
		fallbackPrimaryChip: {
			label: "Shared UI Library",
			sublabel: "Lighting-fast iterations",
			variant: "secondary",
		},
		fallbackSecondaryChip: {
			label: "External Demo",
			variant: "outline",
		},
	},
);

const PRIMARY_CTA = {
	label: "Launch Quick Start Hero",
	description: "Deploy the reusable hero module in under seven minutes.",
	emphasis: "solid" as const,
	badge: "Guided Setup",
};

const SECONDARY_CTA = {
	label: "Preview Guided Demo",
	description: "Tour the module before plugging it into production.",
	emphasis: "outline" as const,
	badge: "See it in action",
};

const CTA_MICROCOPY =
	'Reusable hero experiences adopted by builders. <link href="#dynamic-hero-details">Explore the KPI impact</link>.';

export default function DynamicHeroDemoPage(): JSX.Element {
	const socialProof = DEFAULT_HERO_SOCIAL_PROOF;

	const handleScrollToDetails = () => {
		const section = document.getElementById("dynamic-hero-details");
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
								Test External Module
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
							copy={MOCK_COPY}
							socialProof={socialProof}
							reviews={socialProof.reviews}
							personaLabel="Shared UI Library"
							personaDescription="Persona tuned for DealScale hero builders"
						/>
					</div>

					<div className="flex w-full flex-col items-center gap-8">
						<PersonaCTA
							className="w-full"
							displayMode="both"
							orientation="horizontal"
							primary={PRIMARY_CTA}
							secondary={SECONDARY_CTA}
							microcopy={CTA_MICROCOPY}
							onPrimaryClick={handleScrollToDetails}
							onSecondaryClick={handleScrollToDetails}
						/>
						<p className="max-w-xl text-center text-muted-foreground text-sm">
							Trusted by builders rolling out Quick Start experiences across the
							DealScale platform.
						</p>

						<div className="w-full max-w-5xl" data-beam-collider="true">
							<HeroVideoPreview
								video={MOCK_VIDEO}
								thumbnailAlt="Dynamic hero module mock preview"
							/>
						</div>

						<div
							id="dynamic-hero-details"
							className="flex w-full flex-col gap-6 rounded-3xl border border-border/60 bg-background/70 px-6 py-6 shadow-[0_24px_80px_-40px_rgba(34,197,94,0.35)] md:flex-row md:items-center md:justify-between md:px-10 md:py-8"
						>
							<div
								className="flex items-center gap-4"
								data-beam-collider="true"
							>
								<AvatarCircles
									avatarUrls={socialProof.avatars}
									numPeople={socialProof.numPeople}
									interaction="tooltip"
									className="-space-x-3"
								/>
								<div className="text-left">
									<p className="font-semibold text-foreground text-sm">
										Roll out shared hero experiences 68% faster
									</p>
									<p className="text-muted-foreground text-xs">
										Reusable modules, theme-aware tokens, guided demos out of
										the box.
									</p>
								</div>
							</div>
							<Separator className="md:hidden" />
							<div className="grid grid-cols-3 gap-4 text-center font-semibold text-foreground text-sm">
								<MetricBlock label="Implementation Speed" value="7 min" />
								<MetricBlock label="Content Variants" value="12 personas" />
								<MetricBlock label="Video CTR Lift" value="+38%" />
							</div>
						</div>
					</div>

					<section className="mt-6 max-w-4xl rounded-3xl border border-border/40 bg-muted/40 px-6 py-6 text-muted-foreground text-sm lg:px-10 lg:py-8">
						<p className="leading-relaxed">
							This showcase renders the hero entirely through{" "}
							<code className="rounded bg-muted px-2 py-[3px] text-foreground text-xs">
								@external/dynamic-hero
							</code>{" "}
							utility exports and supporting UI primitives. Clone the layout,
							swap the copy, and plug in your own video to replicate the Quick
							Start hero in any Next.js surface.
						</p>
					</section>
				</div>
			</BackgroundBeamsWithCollision>
		</div>
	);
}

interface MetricBlockProps {
	readonly label: string;
	readonly value: string;
}

function MetricBlock({ label, value }: MetricBlockProps) {
	return (
		<div
			className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-[0_12px_32px_-20px_rgba(34,197,94,0.25)]"
			data-beam-collider="true"
		>
			<p className="text-muted-foreground text-xs uppercase tracking-[0.28em]">
				{label}
			</p>
			<p className={cn("mt-1 font-bold text-foreground text-lg")}>{value}</p>
		</div>
	);
}
