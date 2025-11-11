"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Workflow } from "lucide-react";
import type { AutomationWorkflowMetrics } from "../../types/ai-agents";

interface AutomationWorkflowsProps {
	metrics: AutomationWorkflowMetrics;
}

export function AutomationWorkflows({ metrics }: AutomationWorkflowsProps) {
	const automationScore =
		metrics.depth >= 70
			? "Excellent"
			: metrics.depth >= 50
				? "Good"
				: "Developing";

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Workflow className="h-5 w-5 text-primary" />
					<CardTitle>Automation Workflow Performance</CardTitle>
				</div>
				<CardDescription>
					End-to-end campaign automation metrics
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="mb-1 text-muted-foreground text-sm">
								Workflows Run
							</p>
							<p className="font-bold text-2xl">{metrics.workflows}</p>
							<p className="text-muted-foreground text-xs">This month</p>
						</div>
						<div>
							<p className="mb-1 text-muted-foreground text-sm">
								Completion Rate
							</p>
							<p className="font-bold text-2xl text-green-600 dark:text-green-500">
								{metrics.completion}%
							</p>
							<p className="text-muted-foreground text-xs">Fully automated</p>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between rounded-lg border p-3">
							<div className="flex items-center gap-2">
								<CheckCircle className="h-4 w-4 text-green-600" />
								<span className="text-muted-foreground text-sm">
									Error Recovery Rate
								</span>
							</div>
							<span className="font-bold">{metrics.error_recovery}%</span>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-3">
							<div className="flex items-center gap-2">
								<AlertCircle className="h-4 w-4 text-orange-600" />
								<span className="text-muted-foreground text-sm">
									Manual Overrides
								</span>
							</div>
							<span className="font-bold">{metrics.manual_overrides}</span>
						</div>
					</div>

					<div className="rounded-lg bg-muted p-4">
						<div className="mb-2 flex items-center justify-between">
							<span className="font-medium text-sm">Automation Depth</span>
							<span className="font-bold text-lg text-primary">
								{metrics.depth}%
							</span>
						</div>
						<Progress value={metrics.depth} className="mb-2 h-3" />
						<p className="text-muted-foreground text-xs">
							Freedom Score:{" "}
							<span className="font-medium text-foreground">
								{automationScore}
							</span>
						</p>
					</div>

					<div className="rounded-lg bg-primary/10 p-3 text-muted-foreground text-xs">
						<p>
							<strong>💡 Tip:</strong> {metrics.depth}% of your work is
							AI-driven. The higher the automation depth, the higher your
							freedom score!
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
