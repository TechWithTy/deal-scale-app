"use client";

import { useMemo, useState } from "react";
import { cn, formatDelta } from "../utils";
import type {
	AISummarySection,
	ExpandableAISummaryProps,
	ScoreCard,
} from "../zod-schemas";

/**
 * ExpandableAISummary
 * Reusable, self-contained, expandable section that renders an AI summary header
 * with an optional overall score and a responsive grid of score cards.
 *
 * - No project aliases; only relative imports.
 * - Tailwind utility classes for styling.
 * - Accepts a custom renderCard function for maximum flexibility.
 */
export default function ExpandableAISummary(
	props: ExpandableAISummaryProps & {
		/** Optional custom renderer for each card. */
		renderCard?: (card: ScoreCard, index: number) => React.ReactNode;
	},
) {
	const {
		section,
		defaultExpanded = true,
		gridColsClassName = "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
		className,
		id,
		renderCard,
	} = props;

	const [expanded, setExpanded] = useState(defaultExpanded);

	// Memoized overall progress width (0-100)
	const overallPct = useMemo(() => {
		const v = section.overallScore ?? 0;
		return Math.max(0, Math.min(100, Math.round(v)));
	}, [section.overallScore]);

	const overallDeltaFmt = formatDelta(section.overallDelta);

	return (
		<section
			id={id}
			className={cn(
				"w-full rounded-lg border border-border bg-background",
				className,
			)}
		>
			{/* Header */}
			<div className="flex flex-col gap-3 p-4 border-b border-border sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<button
							type="button"
							aria-label={expanded ? "Collapse section" : "Expand section"}
							onClick={() => setExpanded((v) => !v)}
							className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted/50"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className={cn(
									"h-4 w-4 transition-transform",
									expanded ? "rotate-90" : "rotate-0",
								)}
							>
								<path d="M9 18l6-6-6-6" />
							</svg>
						</button>
						<h2 className="text-lg font-semibold text-foreground">
							{section.title}
						</h2>
					</div>
					{section.description ? (
						<p className="text-sm text-muted-foreground">
							{section.description}
						</p>
					) : null}
				</div>

				{/* Overall score badge */}
				<div className="shrink-0">
					<div className="flex items-center gap-3">
						{typeof section.overallScore === "number" ? (
							<div className="text-right">
								<div className="flex items-baseline gap-2">
									<span className="text-2xl font-semibold text-foreground">
										{overallPct}
										<span className="text-base text-muted-foreground">
											/100
										</span>
									</span>
									{overallDeltaFmt ? (
										<span className={cn("text-sm", overallDeltaFmt.color)}>
											{overallDeltaFmt.text}
										</span>
									) : null}
								</div>
								<div className="mt-2 h-2 w-56 overflow-hidden rounded-full bg-muted">
									<div
										className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500"
										style={{ width: `${overallPct}%` }}
									/>
								</div>
							</div>
						) : null}
					</div>
				</div>
			</div>

			{/* Body */}
			{expanded ? (
				<div className="p-4">
					<div className={cn("grid gap-4", gridColsClassName)}>
						{section.cards.map((card, i) => (
							<div
								key={`${card.title}-${i}`}
								className="rounded-lg border border-border bg-card p-4"
							>
								{renderCard ? (
									<>{renderCard(card, i)}</>
								) : (
									<DefaultCard card={card} />
								)}
							</div>
						))}
					</div>
				</div>
			) : null}
		</section>
	);
}

function DefaultCard({ card }: { card: ScoreCard }) {
	const scorePct =
		typeof card.score === "number"
			? Math.max(0, Math.min(100, Math.round(card.score)))
			: undefined;
	const deltaFmt = formatDelta(card.delta);

	return (
		<div className="space-y-3">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-2">
					{card.icon ? (
						<span className="text-xl" aria-hidden>
							{card.icon}
						</span>
					) : null}
					<h3 className="font-medium text-foreground">{card.title}</h3>
				</div>
				{typeof card.score === "number" ? (
					<div className="text-right">
						<div className="text-sm font-medium text-foreground">
							{card.score}/100
						</div>
						{deltaFmt ? (
							<div className={cn("text-xs", deltaFmt.color)}>
								{deltaFmt.text}
							</div>
						) : null}
					</div>
				) : null}
			</div>

			{typeof scorePct === "number" ? (
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-primary"
						style={{ width: `${scorePct}%` }}
					/>
				</div>
			) : null}

			{card.description ? (
				<p className="text-sm text-muted-foreground">{card.description}</p>
			) : null}

			{Array.isArray(card.bullets) && card.bullets.length > 0 ? (
				<ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
					{card.bullets.map((b, idx) => (
						<li key={idx}>{b}</li>
					))}
				</ul>
			) : null}

			{card.href ? (
				<a
					href={card.href}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
				>
					View on map
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="h-4 w-4"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M17.25 6.75L6.75 17.25M17.25 6.75H9.75m7.5 0v7.5"
						/>
					</svg>
				</a>
			) : null}
		</div>
	);
}

// Re-export types for convenience when importing from components
export type { AISummarySection, ExpandableAISummaryProps, ScoreCard };
