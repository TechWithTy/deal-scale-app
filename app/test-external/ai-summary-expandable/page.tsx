"use client";

import { useEffect, useMemo, useState } from "react";
import {
	ExpandableAISummary,
	ExpandableAISummarySkeleton,
} from "@/external/ai-summary-expandable/components";

export default function AISummaryExpandableTestPage() {
	// Simulate loading to showcase skeleton
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const t = setTimeout(() => setLoading(false), 1200);
		return () => clearTimeout(t);
	}, []);

	const section = useMemo(
		() => ({
			title: "Property Location & Market Analysis",
			description: "Likelihood of finding off-market deals in this area",
			overallScore: 85,
			overallDelta: 2,
			cards: [
				{
					title: "Crime Score",
					description: "Safety assessment of the neighborhood",
					score: 72,
					delta: 0,
					bullets: [
						"Crime rate analysis",
						"Safety trends",
						"Local law enforcement presence",
					],
					href: "https://www.google.com/maps",
					icon: "🛡️",
				},
				{
					title: "Walk Score",
					description: "Walkability of the neighborhood",
					score: 63,
					delta: 1,
					bullets: [
						"Proximity to amenities",
						"Sidewalk quality",
						"Pedestrian safety",
					],
					href: "https://www.google.com/maps",
					icon: "🚶",
				},
				{
					title: "Transit Score",
					description: "Quality of public transportation",
					score: 58,
					delta: -1,
					bullets: [
						"Transit routes",
						"Frequency of service",
						"Access to major hubs",
					],
					href: "https://www.google.com/maps",
					icon: "🚌",
				},
			],
		}),
		[],
	);

	return (
		<div className="p-4 space-y-4">
			<h1 className="font-semibold">AI Summary Expandable — Test Page</h1>

			{/* Decorative gradient banner to mirror screenshot vibe */}
			<div className="relative overflow-hidden rounded-lg border border-border">
				<div className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 h-12" />
				<div className="p-4">
					<p className="text-sm text-muted-foreground">
						Demo gradient banner above the component
					</p>
				</div>
			</div>

			{loading ? (
				<ExpandableAISummarySkeleton />
			) : (
				<ExpandableAISummary
					section={section}
					defaultExpanded
					gridColsClassName="grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
				/>
			)}
		</div>
	);
}
