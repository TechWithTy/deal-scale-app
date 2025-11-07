"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Phone, Star } from "lucide-react";
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
							<p className="mb-1 text-muted-foreground text-sm">Calls Placed</p>
							<p className="font-bold text-2xl">{metrics.calls}</p>
							<p className="text-muted-foreground text-xs">This week</p>
						</div>
						<div>
							<p className="mb-1 text-muted-foreground text-sm">
								Response Rate
							</p>
							<p className="font-bold text-2xl text-primary">
								{metrics.response_rate}%
							</p>
							<Progress value={metrics.response_rate} className="mt-2 h-2" />
						</div>
					</div>

					<div className="space-y-3 rounded-lg border p-3">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								Avg Engagement Time
							</span>
							<span className="font-semibold">
								{formatTime(metrics.avg_time)}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground text-sm">
								Call Quality Score
							</span>
							<div className="flex items-center gap-1">
								<span className="font-semibold">
									{metrics.quality.toFixed(1)}
								</span>
								<Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
								<span className="text-muted-foreground text-xs">/ 5</span>
							</div>
						</div>
					</div>

					<div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
						<p className="font-medium text-green-900 text-sm dark:text-green-300">
							🎯 {metrics.callbacks} callbacks → {metrics.deals} deals closed
						</p>
						<p className="mt-1 text-green-700 text-xs dark:text-green-400">
							{((metrics.deals / metrics.callbacks) * 100).toFixed(0)}% callback
							conversion rate
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
