import { z } from "zod";

/**
 * Score card shown inside the grid.
 */
export const ScoreCardSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	/** Primary numeric score, e.g., 85 */
	score: z.number().min(0).max(100).optional(),
	/** Optional trend vs previous value (e.g., +3) */
	delta: z.number().optional(),
	/** Optional external link for more info */
	href: z.string().url().optional(),
	/** Optional list of bullet points */
	bullets: z.array(z.string()).optional(),
	/** Optional icon emoji or short label */
	icon: z.string().optional(),
});
export type ScoreCard = z.infer<typeof ScoreCardSchema>;

/**
 * Section props used by the ExpandableAISummary component.
 */
export const AISummarySectionSchema = z.object({
	/** Top-left title for the whole section */
	title: z.string(),
	/** Short description displayed under the title */
	description: z.string().optional(),
	/** Overall score for the header area */
	overallScore: z.number().min(0).max(100).optional(),
	/** Positive for up, negative for down */
	overallDelta: z.number().optional(),
	/** Cards that render in the grid */
	cards: z.array(ScoreCardSchema).default([]),
});
export type AISummarySection = z.infer<typeof AISummarySectionSchema>;

/**
 * Top-level props for the ExpandableAISummary component.
 */
export const ExpandableAISummaryPropsSchema = z.object({
	section: AISummarySectionSchema,
	defaultExpanded: z.boolean().default(true),
	gridColsClassName: z
		.string()
		.default("grid-cols-1 md:grid-cols-2 xl:grid-cols-3"),
	className: z.string().optional(),
	id: z.string().optional(),
});
export type ExpandableAISummaryProps = z.infer<
	typeof ExpandableAISummaryPropsSchema
>;
