"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Workflow, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
							<p className="text-sm text-muted-foreground mb-1">
								Workflows Run
							</p>
							<p className="text-2xl font-bold">{metrics.workflows}</p>
							<p className="text-xs text-muted-foreground">This month</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground mb-1">
								Completion Rate
							</p>
							<p className="text-2xl font-bold text-green-600 dark:text-green-500">
								{metrics.completion}%
							</p>
							<p className="text-xs text-muted-foreground">Fully automated</p>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between rounded-lg border p-3">
							<div className="flex items-center gap-2">
								<CheckCircle className="h-4 w-4 text-green-600" />
								<span className="text-sm text-muted-foreground">
									Error Recovery Rate
								</span>
							</div>
							<span className="font-bold">{metrics.error_recovery}%</span>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-3">
							<div className="flex items-center gap-2">
								<AlertCircle className="h-4 w-4 text-orange-600" />
								<span className="text-sm text-muted-foreground">
									Manual Overrides
								</span>
							</div>
							<span className="font-bold">{metrics.manual_overrides}</span>
						</div>
					</div>

					<div className="rounded-lg bg-muted p-4">
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm font-medium">Automation Depth</span>
							<span className="font-bold text-lg text-primary">
								{metrics.depth}%
							</span>
						</div>
						<Progress value={metrics.depth} className="h-3 mb-2" />
						<p className="text-xs text-muted-foreground">
							Freedom Score:{" "}
							<span className="font-medium text-foreground">
								{automationScore}
							</span>
						</p>
					</div>

					<div className="rounded-lg bg-primary/10 p-3 text-xs text-muted-foreground">
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
