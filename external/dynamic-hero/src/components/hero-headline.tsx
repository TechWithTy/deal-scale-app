"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

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
import { cn } from "@/lib/utils/index";

import { DEFAULT_HERO_SOCIAL_PROOF } from "../fixtures/social-proof";
import type {
	HeroSocialProof,
	HeroSocialProofReview,
} from "../types/social-proof";
import type { ResolvedHeroCopy } from "../utils/copy";

const PROBLEM_INTERVAL_MS = 8200;
const SOLUTION_INTERVAL_MS = 10200;
const FEAR_INTERVAL_MS = 9400;
const MAX_PHRASE_LENGTH = 64;

const baseSpanAnimation = {
	initial: { opacity: 0, y: -10, filter: "blur(6px)" },
	animate: { opacity: 1, y: 0, filter: "blur(0px)" },
	exit: { opacity: 0, y: 10, filter: "blur(8px)" },
	transition: { duration: 0.46, ease: "easeInOut" as const },
};

interface HeroHeadlineProps {
	readonly copy: ResolvedHeroCopy;
	readonly className?: string;
	readonly socialProof?: HeroSocialProof;
	readonly showSocialProof?: boolean;
	readonly showChips?: boolean;
	readonly showPersonaChip?: boolean;
	readonly personaLabel?: string;
	readonly personaDescription?: string;
	readonly reviews?: HeroSocialProofReview[];
}

export function HeroHeadline({
	copy,
	className,
	socialProof,
	showSocialProof = true,
	showChips = true,
	showPersonaChip = true,
	personaLabel,
	personaDescription,
	reviews,
}: HeroHeadlineProps): JSX.Element {
	const truncate = useMemo(
		() => (value: string) => {
			const normalized = value.trim();
			if (normalized.length <= MAX_PHRASE_LENGTH) {
				return normalized;
			}
			return `${normalized.slice(0, MAX_PHRASE_LENGTH - 1).trimEnd()}…`;
		},
		[],
	);

	const problems = useMemo(() => {
		const source = copy.rotations?.problems ?? [copy.values.problem];
		const cleaned = source
			.map((phrase, index) => ({
				index,
				text: truncate(phrase ?? ""),
			}))
			.filter((entry, position, arr) => {
				if (!entry.text.length) {
					return false;
				}
				const firstMatch = arr.find(
					(other) => other.text.toLowerCase() === entry.text.toLowerCase(),
				);
				return firstMatch?.index === entry.index;
			})
			.map((entry) => entry.text);
		return cleaned.length ? cleaned : [truncate(copy.values.problem)];
	}, [copy.rotations?.problems, copy.values.problem, truncate]);
	const solutions = useMemo(
		() =>
			(copy.rotations?.solutions ?? [copy.values.solution]).map((value) =>
				truncate(value ?? ""),
			),
		[copy.rotations?.solutions, copy.values.solution, truncate],
	);
	const fears = useMemo(
		() =>
			(copy.rotations?.fears ?? [copy.values.fear]).map((value) =>
				truncate(value ?? ""),
			),
		[copy.rotations?.fears, copy.values.fear, truncate],
	);

	const problemIndex = useRotatingIndex(problems, PROBLEM_INTERVAL_MS);
	const solutionIndex = useRotatingIndex(solutions, SOLUTION_INTERVAL_MS);
	const fearIndex = useRotatingIndex(fears, FEAR_INTERVAL_MS);

	const problemText =
		problems[problemIndex]?.trim() ?? problems[0]?.trim() ?? "";
	const solutionText =
		solutions[solutionIndex]?.trim() ?? solutions[0]?.trim() ?? "";
	const fearText = fears[fearIndex]?.trim() ?? fears[0]?.trim() ?? "";
	const problemDisplayText =
		problemText.length > 0
			? `${problemText[0]?.toUpperCase() ?? ""}${problemText.slice(1)}`
			: problemText;

	if (process.env.NODE_ENV !== "production") {
		// eslint-disable-next-line no-console
		console.debug("[HeroHeadline] flip state", {
			problems: problems.join(" | "),
			problemIndex,
			problemText,
			solutionIndex,
			solutionText,
			fearIndex,
			fearText,
		});
	}

	const proof = socialProof ?? DEFAULT_HERO_SOCIAL_PROOF;
	const proofReviews = reviews ?? proof.reviews ?? [];

	const primaryChip = copy.chips?.primary;
	const secondaryChip = copy.chips?.secondary;

	const primaryChipClasses = primaryChip
		? cn(
				badgeVariants({ variant: primaryChip.variant ?? "secondary" }),
				"rounded-full border border-primary/40 bg-primary/90 px-5 py-[7px] text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-foreground shadow-[0_8px_24px_rgba(32,99,255,0.35)]",
			)
		: undefined;
	const secondaryChipClasses = secondaryChip
		? cn(
				badgeVariants({ variant: secondaryChip.variant ?? "outline" }),
				"rounded-full border border-primary/35 bg-background/70 px-5 py-[7px] text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground shadow-[0_6px_16px_rgba(15,23,42,0.2)]",
			)
		: undefined;

	const personaChipLabel =
		personaLabel ?? copy.chips?.primary?.label ?? "AI Sellers";
	const personaChipTitle =
		personaDescription ??
		(personaChipLabel ? `${personaChipLabel} persona` : undefined);
	const personaChipClasses = cn(
		badgeVariants({ variant: "secondary" }),
		"rounded-full border border-primary/45 bg-gradient-to-r from-primary/95 via-primary to-primary/85 px-6 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-primary-foreground shadow-[0_18px_55px_rgba(64,106,255,0.45)]",
	);

	return (
		<div
			className={cn(
				"relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center",
				className,
			)}
		>
			<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
				<Globe
					className={cn(
						"opacity-30 saturate-[1.2]",
						"-translate-x-[18%] w-[200vw] max-w-none translate-y-28",
						"sm:-translate-x-[12%] sm:w-[160vw] sm:translate-y-20",
						"md:-translate-x-[10%] md:w-[130vw] md:translate-y-12",
						"lg:-translate-x-[6%] lg:w-[105vw] lg:translate-y-6",
						"xl:-translate-x-[4%] xl:w-[95vw] xl:translate-y-2",
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
				{showChips && (primaryChipClasses || secondaryChipClasses) ? (
					<TooltipProvider>
						<div className="flex flex-col items-center gap-3">
							<div className="flex flex-wrap items-center justify-center gap-2">
								{primaryChip && primaryChipClasses ? (
									<Tooltip delayDuration={150}>
										<TooltipTrigger asChild>
											<span className={primaryChipClasses}>
												{primaryChip.label}
											</span>
										</TooltipTrigger>
										{primaryChip.label ? (
											<TooltipContent side="top" className="text-xs">
												{`${primaryChip.label} program`}
											</TooltipContent>
										) : null}
									</Tooltip>
								) : null}
								{secondaryChip && secondaryChipClasses ? (
									<Tooltip delayDuration={150}>
										<TooltipTrigger asChild>
											<span className={secondaryChipClasses}>
												{secondaryChip.label}
											</span>
										</TooltipTrigger>
										{secondaryChip.label ? (
											<TooltipContent side="top" className="text-xs">
												{`${secondaryChip.label} focus`}
											</TooltipContent>
										) : null}
									</Tooltip>
								) : null}
							</div>
						</div>
					</TooltipProvider>
				) : null}

				{showPersonaChip && personaChipLabel ? (
					<TooltipProvider>
						<div className="flex flex-col items-center gap-3">
							<Tooltip delayDuration={150}>
								<TooltipTrigger asChild>
									<span className={personaChipClasses}>{personaChipLabel}</span>
								</TooltipTrigger>
								{personaChipTitle ? (
									<TooltipContent side="bottom" className="text-xs">
										{personaChipTitle}
									</TooltipContent>
								) : null}
							</Tooltip>
						</div>
					</TooltipProvider>
				) : null}

				<div className="h-px w-20 bg-gradient-to-r from-transparent via-primary/60 to-transparent md:w-32" />
				<motion.h1
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.24 }}
					className="text-balance font-semibold leading-tight text-foreground drop-shadow-[0_3px_12px_rgba(8,8,24,0.35)] text-[clamp(2rem,4vw,2.75rem)]"
				>
					<span className="font-semibold">Stop </span>
					<AnimatePresence mode="wait" initial={false}>
						<motion.span
							key={`${problemIndex}-${problemDisplayText}`}
							{...baseSpanAnimation}
							className="inline-flex min-h-[calc(1em+0.35rem)] items-center bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text px-1 text-transparent font-semibold"
						>
							{problemDisplayText}
						</motion.span>
					</AnimatePresence>
					<span>, start </span>
					<AnimatePresence mode="sync" initial={false}>
						<motion.span
							key={`${solutionIndex}-${solutionText}`}
							{...baseSpanAnimation}
							className="inline-flex min-h-[calc(1em+0.35rem)] items-center px-1 text-primary font-semibold"
						>
							{solutionText}
						</motion.span>
					</AnimatePresence>
					<span> before </span>
					<AnimatePresence mode="sync" initial={false}>
						<motion.span
							key={`${fearIndex}-${fearText}`}
							{...baseSpanAnimation}
							className="inline-flex min-h-[calc(1em+0.35rem)] items-center bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text px-1 text-transparent font-semibold"
						>
							{fearText}
						</motion.span>
					</AnimatePresence>
					<span>.</span>
				</motion.h1>

				{copy.subtitle ? (
					<motion.p
						initial={{ opacity: 0, y: 4 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.2 }}
						className="max-w-2xl text-balance text-base text-muted-foreground drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] md:text-lg"
					>
						{copy.subtitle}
					</motion.p>
				) : null}

				{showSocialProof && proof.avatars.length ? (
					<div className="flex flex-col items-center gap-3 text-muted-foreground text-sm">
						<AvatarCircles
							avatarUrls={proof.avatars}
							numPeople={proof.numPeople}
							reviews={proofReviews}
							className="justify-center"
						/>
						{proof.caption ? (
							<p className="max-w-xl text-center font-semibold text-foreground/90 text-xs uppercase tracking-[0.28em] drop-shadow-[0_1px_6px_rgba(21,94,255,0.45)] dark:text-white">
								{proof.caption}
							</p>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
}

function useRotatingIndex(items: readonly string[], interval: number): number {
	const [index, setIndex] = useState(0);
	const length = items.length;

	// biome-ignore lint/correctness/useExhaustiveDependencies: rotation strings are tracked via array identity
	useEffect(() => {
		setIndex(0);
	}, [items]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: the rotation payload is keyed off the incoming array
	useEffect(() => {
		if (length <= 1) {
			return;
		}
		const timer = setInterval(
			() => setIndex((current) => (current + 1) % length),
			interval,
		);
		return () => clearInterval(timer);
	}, [interval, items, length]);

	if (length === 0) {
		return 0;
	}

	return index % length;
}
