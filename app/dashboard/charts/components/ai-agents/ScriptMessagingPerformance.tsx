"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Smile } from "lucide-react";
import type { ScriptMessagingMetrics } from "../../types/ai-agents";

interface ScriptMessagingPerformanceProps {
	metrics: ScriptMessagingMetrics;
}

export function ScriptMessagingPerformance({
	metrics,
}: ScriptMessagingPerformanceProps) {
	const getQualityEmoji = () => {
		if (metrics.human_edit_rate < 15) return "😊";
		if (metrics.human_edit_rate < 20) return "🙂";
		return "😐";
	};

	const qualityLabel =
		metrics.human_edit_rate < 15
			? "Smart, Personal, Human!"
			: metrics.human_edit_rate < 20
				? "Good Quality"
				: "Needs Improvement";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5 text-primary" />
					<CardTitle>Script & Messaging Performance</CardTitle>
				</div>
				<CardDescription>
					AI-generated outreach quality and engagement
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="mb-1 text-muted-foreground text-sm">
								Messages Sent
							</p>
							<p className="font-bold text-2xl">{metrics.messages}</p>
							<p className="text-muted-foreground text-xs">
								Personalized outreach
							</p>
						</div>
						<div>
							<p className="mb-1 text-muted-foreground text-sm">Reply Rate</p>
							<p className="font-bold text-2xl text-green-600 dark:text-green-500">
								{metrics.reply_rate}%
							</p>
							<p className="text-green-600 text-xs dark:text-green-500">
								↑12% from last week
							</p>
						</div>
					</div>

					<div className="space-y-3">
						<div>
							<div className="mb-1 flex justify-between text-sm">
								<span className="text-muted-foreground">
									Personalization Depth
								</span>
								<span className="font-medium">{metrics.personalization}%</span>
							</div>
							<Progress value={metrics.personalization} className="h-2" />
						</div>

						<div className="flex items-center justify-between rounded-lg border p-3">
							<span className="text-muted-foreground text-sm">
								Auto Follow-Ups
							</span>
							<span className="font-bold text-lg text-primary">
								{metrics.auto_followups}
							</span>
						</div>

						<div className="rounded-lg border p-3">
							<div className="mb-2 flex items-center justify-between">
								<span className="text-muted-foreground text-sm">
									Human Edit Rate
								</span>
								<div className="flex items-center gap-2">
									<span className="text-2xl">{getQualityEmoji()}</span>
									<span className="font-semibold">
										{metrics.human_edit_rate}%
									</span>
								</div>
							</div>
							<Progress value={100 - metrics.human_edit_rate} className="h-2" />
							<p className="mt-1 text-muted-foreground text-xs">
								{qualityLabel}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
