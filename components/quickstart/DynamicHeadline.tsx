"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { AvatarCircles } from "@/components/ui/avatar-circles";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Globe } from "@/components/ui/globe";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getQuickStartHeadlineCopy } from "@/lib/config/quickstart/headlines";
import type { QuickStartPersonaId } from "@/lib/config/quickstart/wizardFlows";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";
import { cn } from "@/lib/utils";

const TRUST_SOCIAL_PROOF: Record<
	QuickStartPersonaId | "default",
	{
		caption?: string;
		avatars: Array<{ imageUrl: string; profileUrl: string }>;
		numPeople: number;
	}
> = {
	default: {
		avatars: [
			{
				imageUrl: "https://i.pravatar.cc/80?img=32",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=48",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=12",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=56",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
		],
		numPeople: 200,
	},
	agent: {
		avatars: [
			{
				imageUrl: "https://i.pravatar.cc/80?img=10",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=18",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=21",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=34",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
		],
		numPeople: 120,
	},
	investor: {
		avatars: [
			{
				imageUrl: "https://i.pravatar.cc/80?img=14",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=27",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=39",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=45",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
		],
		numPeople: 90,
	},
	wholesaler: {
		avatars: [
			{
				imageUrl: "https://i.pravatar.cc/80?img=25",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=31",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=52",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=63",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
		],
		numPeople: 75,
	},
	loan_officer: {
		avatars: [
			{
				imageUrl: "https://i.pravatar.cc/80?img=7",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=19",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=28",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
			{
				imageUrl: "https://i.pravatar.cc/80?img=37",
				profileUrl: "https://www.linkedin.com/company/dealscale/",
			},
		],
		numPeople: 60,
	},
};

const TRUST_REVIEWS: Record<
	QuickStartPersonaId | "default",
	Array<{
		title: string;
		subtitle?: string;
		quote?: string;
		rating?: number;
	}>
> = {
	default: [
		{
			title: "Elena • Broker",
			subtitle: "Closed 12 deals last quarter",
			quote: "DealScale keeps every follow-up on pace.",
			rating: 5,
		},
		{
			title: "Marcus • Team Lead",
			subtitle: "ISA team of 6",
			quote: "The automations rescued 8 hours a week.",
			rating: 4,
		},
		{
			title: "Priya • Investor",
			quote: "Pipeline updates finally feel effortless.",
			rating: 5,
		},
		{
			title: "Jon • Wholesaler",
			quote: "Follow-up is now a strength, not a chore.",
			rating: 5,
		},
	],
	agent: [
		{
			title: "Alicia • Keller Williams",
			subtitle: "Top 1% agent",
			quote: "Listings stay warmer thanks to the AI nudges.",
			rating: 5,
		},
		{
			title: "Tom • ISA Director",
			quote: "Every rep loves the ready-to-send scripts.",
			rating: 4,
		},
		{
			title: "Grace • Regional Coach",
			quote: "DealScale helped the team shave 48 hours a month.",
			rating: 5,
		},
	],
	investor: [
		{
			title: "Leo • Private Equity",
			quote: "Never miss a motivated seller again.",
			rating: 5,
		},
		{
			title: "Carmen • Syndicator",
			quote: "The alerts keep capital deployed.",
			rating: 4,
		},
	],
	wholesaler: [
		{
			title: "Sam • Multi-market wholesaler",
			quote: "Automations keep buyers looped in overnight.",
			rating: 5,
		},
	],
	loan_officer: [
		{
			title: "Derek • Private Lender",
			quote: "Borrowers get routed in minutes instead of hours.",
			rating: 4,
		},
	],
};

interface DynamicHeadlineProps {
	readonly personaId?: QuickStartPersonaId | null;
}

const PROBLEM_INTERVAL_MS = 5200;
const SOLUTION_INTERVAL_MS = 6800;
const FEAR_INTERVAL_MS = 6000;
const HOPE_INTERVAL_MS = 6400;

const baseSpanAnimation = {
	initial: { opacity: 0, y: -10 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 10 },
	transition: { duration: 0.32 },
};

const DynamicHeadline = ({ personaId }: DynamicHeadlineProps) => {
	const selectedPersona = useQuickStartWizardDataStore(
		(state) => state.personaId,
	);

	const activePersona = personaId ?? selectedPersona ?? "default";
	const copy = useMemo(
		() => getQuickStartHeadlineCopy(activePersona),
		[activePersona],
	);
	const trustProof =
		TRUST_SOCIAL_PROOF[activePersona] ?? TRUST_SOCIAL_PROOF.default;
	const trustReviews = TRUST_REVIEWS[activePersona] ?? TRUST_REVIEWS.default;
	const trustCaption = trustProof.caption?.trim();

	const problemsKey = useMemo(
		() => copy.rotations.problems.join("|"),
		[copy.rotations.problems],
	);
	const hopesKey = useMemo(
		() => copy.rotations.hopes?.join("|") ?? copy.values.hope,
		[copy.rotations.hopes, copy.values.hope],
	);
	const solutionsKey = useMemo(
		() => copy.rotations.solutions.join("|"),
		[copy.rotations.solutions],
	);
	const fearsKey = useMemo(
		() => copy.rotations.fears.join("|"),
		[copy.rotations.fears],
	);

	const problems = useMemo(() => copy.rotations.problems, [problemsKey]);
	const solutions = useMemo(() => copy.rotations.solutions, [solutionsKey]);
	const fears = useMemo(() => copy.rotations.fears, [fearsKey]);
	const hopes = useMemo(
		() => copy.rotations.hopes ?? [copy.values.hope],
		[hopesKey],
	);

	const [problemIndex, setProblemIndex] = useState(0);
	const [solutionIndex, setSolutionIndex] = useState(0);
	const [fearIndex, setFearIndex] = useState(0);
	const [hopeIndex, setHopeIndex] = useState(0);

	useEffect(() => {
		setProblemIndex(0);
		setSolutionIndex(0);
		setFearIndex(0);
		setHopeIndex(0);
	}, [problemsKey, solutionsKey, fearsKey, hopesKey]);

	useEffect(() => {
		const intervals: Array<ReturnType<typeof setInterval>> = [];

		if (problems.length > 1) {
			intervals.push(
				setInterval(
					() => setProblemIndex((current) => (current + 1) % problems.length),
					PROBLEM_INTERVAL_MS,
				),
			);
		}

		if (solutions.length > 1) {
			intervals.push(
				setInterval(
					() => setSolutionIndex((current) => (current + 1) % solutions.length),
					SOLUTION_INTERVAL_MS,
				),
			);
		}

		if (fears.length > 1) {
			intervals.push(
				setInterval(
					() => setFearIndex((current) => (current + 1) % fears.length),
					FEAR_INTERVAL_MS,
				),
			);
		}

		if (hopes.length > 1) {
			intervals.push(
				setInterval(
					() => setHopeIndex((current) => (current + 1) % hopes.length),
					HOPE_INTERVAL_MS,
				),
			);
		}

		return () => {
			intervals.forEach((timer) => clearInterval(timer));
		};
	}, [
		problems.length,
		solutions.length,
		fears.length,
		hopes.length,
		problemsKey,
		solutionsKey,
		fearsKey,
		hopesKey,
	]);

	const problemCopy = problems[problemIndex] ?? copy.values.problem;
	const solutionCopy = solutions[solutionIndex] ?? copy.values.solution;
	const fearCopy = fears[fearIndex] ?? copy.values.fear;
	const hopeCopy = hopes[hopeIndex] ?? copy.values.hope;

	const personaBaseline =
		copy.chips?.primary?.sublabel ??
		copy.chips?.secondary?.label ??
		copy.values.solution ??
		"AI Agents";
	const personaChipTitle = `${personaBaseline} persona`;
	const primaryChipTitle = copy.chips?.primary?.label
		? `${copy.chips.primary.label} program`
		: undefined;
	const secondaryChipTitle = copy.chips?.secondary?.label
		? `${copy.chips.secondary.label} focus`
		: undefined;
	const primaryChipClasses = copy.chips?.primary
		? cn(
				badgeVariants({ variant: copy.chips.primary.variant ?? "secondary" }),
				"border border-white/40 bg-primary/90 px-4 py-[6px] text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow-[0_8px_24px_rgba(32,99,255,0.35)]",
			)
		: undefined;
	const secondaryChipClasses = copy.chips?.secondary
		? cn(
				badgeVariants({ variant: copy.chips.secondary.variant ?? "outline" }),
				"border border-primary/40 bg-background/65 px-4 py-[6px] text-xs font-semibold uppercase tracking-wide text-foreground shadow-[0_6px_16px_rgba(15,23,42,0.2)]",
			)
		: undefined;
	const personaChipClasses = cn(
		badgeVariants({ variant: "secondary" }),
		"border border-primary/45 bg-gradient-to-r from-primary/95 via-primary to-primary/85 px-6 py-2 text-lg font-semibold uppercase tracking-[0.4em] text-primary-foreground shadow-[0_18px_55px_rgba(64,106,255,0.45)]",
	);

	return (
		<div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
				<Globe
					className={cn(
						"opacity-30 saturate-[1.2]",
						"w-[200vw] max-w-none translate-y-28 -translate-x-[18%]",
						"sm:w-[160vw] sm:translate-y-20 sm:-translate-x-[12%]",
						"md:w-[130vw] md:translate-y-12 md:-translate-x-[10%]",
						"lg:w-[105vw] lg:translate-y-6 lg:-translate-x-[6%]",
						"xl:w-[95vw] xl:translate-y-2 xl:-translate-x-[4%]",
					)}
					style={{
						maskImage:
							"radial-gradient(circle at 50% 45%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 75%)",
					}}
				/>
				<ProgressiveBlur
					position="bottom"
					height="55%"
					blurLevels={[0.5, 1, 2, 6, 12, 18, 24, 32]}
					className="pointer-events-none hidden md:block"
				/>
				<div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent via-background/85 to-background" />
			</div>

			<div className="relative z-10 flex w-full flex-col items-center gap-6 text-center">
				{copy.chips?.primary ? (
					<TooltipProvider>
						<div className="flex flex-col items-center gap-3">
							<div className="flex flex-wrap items-center justify-center gap-2">
								<Tooltip delayDuration={150}>
									<TooltipTrigger asChild>
										<span className={primaryChipClasses}>
											{copy.chips.primary.label}
										</span>
									</TooltipTrigger>
									{primaryChipTitle ? (
										<TooltipContent side="top" className="text-xs">
											{primaryChipTitle}
										</TooltipContent>
									) : null}
								</Tooltip>
								{copy.chips.secondary && secondaryChipClasses ? (
									<Tooltip delayDuration={150}>
										<TooltipTrigger asChild>
											<span className={secondaryChipClasses}>
												{copy.chips.secondary.label}
											</span>
										</TooltipTrigger>
										{secondaryChipTitle ? (
											<TooltipContent side="top" className="text-xs">
												{secondaryChipTitle}
											</TooltipContent>
										) : null}
									</Tooltip>
								) : null}
							</div>
						</div>
					</TooltipProvider>
				) : null}

				<div className="flex flex-col items-center gap-3 text-center">
					<TooltipProvider>
						<Tooltip delayDuration={150}>
							<TooltipTrigger asChild>
								<span className={personaChipClasses}>{personaBaseline}</span>
							</TooltipTrigger>
							<TooltipContent side="bottom" className="text-xs">
								{personaChipTitle}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				<motion.h1
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.24 }}
					className="text-balance font-bold text-3xl text-foreground drop-shadow-[0_3px_12px_rgba(8,8,24,0.35)] md:text-4xl"
					data-testid="quickstart-headline-title"
				>
					<span>Stop </span>
					<span className="font-semibold text-destructive">
						<AnimatePresence mode="wait">
							<motion.span
								key={problemCopy}
								data-testid="quickstart-problem"
								{...baseSpanAnimation}
							>
								{problemCopy}
							</motion.span>
						</AnimatePresence>
					</span>
					<span>, start </span>
					<span className="font-semibold text-primary">
						<AnimatePresence mode="wait">
							<motion.span
								key={solutionCopy}
								data-testid="quickstart-solution"
								{...baseSpanAnimation}
							>
								{solutionCopy}
							</motion.span>
						</AnimatePresence>
					</span>
					<span> - before </span>
					<span className="font-semibold text-amber-400 dark:text-amber-300">
						<AnimatePresence mode="wait">
							<motion.span
								key={fearCopy}
								data-testid="quickstart-fear"
								{...baseSpanAnimation}
							>
								{fearCopy}
							</motion.span>
						</AnimatePresence>
					</span>
					<span>. </span>
					<span>Imagine </span>
					<span className="font-semibold text-emerald-400 dark:text-emerald-300">
						<AnimatePresence mode="wait">
							<motion.span
								key={hopeCopy}
								data-testid="quickstart-hope"
								{...baseSpanAnimation}
							>
								{hopeCopy}
							</motion.span>
						</AnimatePresence>
					</span>
					<span>.</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
					className="max-w-2xl text-balance text-base text-muted-foreground drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] md:text-lg"
					data-testid="quickstart-headline-subtitle"
				>
					{copy.subtitle}
				</motion.p>

				<div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
					<AvatarCircles
						avatarUrls={trustProof.avatars}
						numPeople={trustProof.numPeople}
						reviews={trustReviews}
						className="justify-center"
					/>
					{trustCaption ? (
						<p className="max-w-xl text-center text-xs font-semibold uppercase tracking-[0.28em] text-foreground/90 drop-shadow-[0_1px_6px_rgba(21,94,255,0.45)] dark:text-white">
							{trustCaption}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default DynamicHeadline;
