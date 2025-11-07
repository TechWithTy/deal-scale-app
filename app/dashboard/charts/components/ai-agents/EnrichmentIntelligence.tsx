"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Database, Zap } from "lucide-react";
import type { EnrichmentMetrics } from "../../types/ai-agents";

interface EnrichmentIntelligenceProps {
	metrics: EnrichmentMetrics;
}

export function EnrichmentIntelligence({
	metrics,
}: EnrichmentIntelligenceProps) {
	const getSignalColor = (strength: number) => {
		if (strength >= 80) return "text-green-600 dark:text-green-500";
		if (strength >= 60) return "text-yellow-600 dark:text-yellow-500";
		return "text-orange-600 dark:text-orange-500";
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Database className="h-5 w-5 text-primary" />
					<CardTitle>Lead Enrichment & Intelligence</CardTitle>
				</div>
				<CardDescription>
					Automated data enrichment and intent detection
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="mb-1 text-muted-foreground text-sm">
								Leads Enriched
							</p>
							<p className="font-bold text-2xl">
								{metrics.leads_enriched.toLocaleString()}
							</p>
							<p className="text-muted-foreground text-xs">Auto-enriched</p>
						</div>
						<div>
							<p className="mb-1 text-muted-foreground text-sm">Match Rate</p>
							<p className="font-bold text-2xl text-green-600 dark:text-green-500">
								{metrics.match_rate}%
							</p>
							<Progress value={metrics.match_rate} className="mt-2 h-2" />
						</div>
					</div>

					<div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
						<div className="mb-2 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Zap className="h-4 w-4 text-primary" />
								<span className="font-medium text-sm">
									High-Intent Signals Found
								</span>
							</div>
							<Badge variant="default" className="px-3 py-1 text-lg">
								{metrics.high_intent}
							</Badge>
						</div>
						<p className="text-muted-foreground text-xs">
							AI identified 2X more hot leads this week
						</p>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Avg Signal Strength</span>
							<span
								className={`font-bold ${getSignalColor(metrics.signal_strength)}`}
							>
								{metrics.signal_strength}/100
							</span>
						</div>
						<Progress value={metrics.signal_strength} className="h-2" />
					</div>

					<div className="rounded-lg border p-3">
						<div className="flex items-center justify-between">
							<span className="font-medium text-sm">Top Signal Source</span>
							<Badge variant="secondary">{metrics.top_source}</Badge>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
