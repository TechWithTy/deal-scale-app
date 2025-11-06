"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Phone, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { VoiceAgentMetrics } from "../../types/ai-agents";

interface VoiceAgentPerformanceProps {
	metrics: VoiceAgentMetrics;
}

export function VoiceAgentPerformance({ metrics }: VoiceAgentPerformanceProps) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}m ${secs}s`;
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Phone className="h-5 w-5 text-primary" />
					<CardTitle>AI Voice Performance</CardTitle>
				</div>
				<CardDescription>
					Automated voice call metrics and quality
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground mb-1">Calls Placed</p>
							<p className="text-2xl font-bold">{metrics.calls}</p>
							<p className="text-xs text-muted-foreground">This week</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground mb-1">
								Response Rate
							</p>
							<p className="text-2xl font-bold text-primary">
								{metrics.response_rate}%
							</p>
							<Progress value={metrics.response_rate} className="mt-2 h-2" />
						</div>
					</div>

					<div className="rounded-lg border p-3 space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">
								Avg Engagement Time
							</span>
							<span className="font-semibold">
								{formatTime(metrics.avg_time)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">
								Call Quality Score
							</span>
							<div className="flex items-center gap-1">
								<span className="font-semibold">
									{metrics.quality.toFixed(1)}
								</span>
								<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
								<span className="text-xs text-muted-foreground">/ 5</span>
							</div>
						</div>
					</div>

					<div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
						<p className="text-sm font-medium text-green-900 dark:text-green-300">
							🎯 {metrics.callbacks} callbacks → {metrics.deals} deals closed
						</p>
						<p className="text-xs text-green-700 dark:text-green-400 mt-1">
							{((metrics.deals / metrics.callbacks) * 100).toFixed(0)}% callback
							conversion rate
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
