"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRemainingAI, useUserStore } from "@/lib/stores/userStore";
import type { Property } from "@/types/_dashboard/property";
import {
	ExpandableAISummary,
	ExpandableAISummarySkeleton,
} from "external/ai-summary-expandable/components";
import { useMemo, useState } from "react";

interface SectionCard {
	title: string;
	subTitle?: string;
	primaryLabel?: string;
	score: number;
	delta?: number;
	bullets?: string[];
	href?: string;
	linkLabel?: string;
	icon?: string;
	showArrow?: boolean;
}

interface Section {
	title: string;
	description?: string;
	overallScore: number;
	overallDelta?: number;
	headerBand?: { leftLabel: string; rightLabel: string };
	features?: string[];
	cards: SectionCard[];
}

interface Props {
	property: Property;
}

export default function AISummaryCardClient({ property }: Props) {
	const [provider, setProvider] = useState("external-ai");
	const [section, setSection] = useState<Section | null>(null);
	const [loading, setLoading] = useState(false);
	const remainingAI = useRemainingAI();
	const consumeAI = useUserStore((s) => s.consumeAI);

	const cityLabel = useMemo(
		() => property.address.city ?? "City",
		[property.address.city],
	);

	const buildSection = (): Section => ({
		title: `Off-Market Potential — ${cityLabel}`,
		description: "Likelihood of finding off-market deals in this area",
		overallScore: 85,
		overallDelta: 2,
		headerBand: { leftLabel: "Low Potential", rightLabel: "High Potential" },
		features: [
			"Analyzes historical off-market transactions",
			"Considers local market conditions",
			"Identifies potential motivated sellers",
		],
		cards: [
			{
				title: "Crime Score",
				subTitle: "Safety assessment of the neighborhood",
				primaryLabel: "Crime Score",
				score: 72,
				delta: 0,
				bullets: [
					"Crime rate analysis",
					"Safety trends",
					"Local law enforcement presence",
				],
				href: "https://www.google.com/maps",
				linkLabel: "View on map →",
				icon: "🛡️",
				showArrow: true,
			},
			{
				title: "Walk Score",
				subTitle: "Walkability of the neighborhood",
				primaryLabel: "Walk Score",
				score: 63,
				delta: 1,
				bullets: [
					"Proximity to amenities",
					"Sidewalk quality",
					"Pedestrian safety",
				],
				href: "https://www.google.com/maps",
				linkLabel: "View on map →",
				icon: "🚶",
				showArrow: true,
			},
			{
				title: "Transit Score",
				subTitle: "Quality of public transportation",
				primaryLabel: "Transit Score",
				score: 58,
				delta: -1,
				bullets: [
					"Transit routes",
					"Frequency of service",
					"Access to major hubs",
				],
				href: "https://www.google.com/maps",
				linkLabel: "View on map →",
				icon: "🚌",
				showArrow: true,
			},
		],
	});

	const onGenerate = async () => {
		if (remainingAI <= 0 || loading) return;
		setLoading(true);
		// Simulate external AI request; wire real provider later
		await new Promise((r) => setTimeout(r, 900));
		setSection(buildSection());
		consumeAI(1);
		setLoading(false);
	};

	return (
		<Card className="p-4">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground text-xs">Provider</span>
					<select
						value={provider}
						onChange={(e) => setProvider(e.target.value)}
						className="rounded-md border bg-background px-2 py-1 text-xs"
					>
						<option value="external-ai">External AI</option>
						<option value="mock">Mock (Demo)</option>
					</select>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-muted-foreground text-xs">
						AI Credits Remaining: <strong>{remainingAI}</strong>
					</span>
					<Button
						type="button"
						size="sm"
						onClick={onGenerate}
						disabled={remainingAI <= 0 || loading}
					>
						{loading ? "Generating..." : "Generate Summary (1 credit)"}
					</Button>
				</div>
			</div>

			{loading && !section ? (
				<ExpandableAISummarySkeleton />
			) : section ? (
				<ExpandableAISummary
					section={section}
					defaultExpanded
					gridColsClassName="grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
				/>
			) : (
				<div className="text-muted-foreground text-sm">
					Click "Generate Summary" to analyze this property using your AI
					credits.
				</div>
			)}
		</Card>
	);
}
