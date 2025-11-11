"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lightbulb } from "lucide-react";

interface PlatformIntelligenceProps {
	enabled: boolean;
	onEnabledChange: (enabled: boolean) => void;
	itemType: "campaign" | "workflow" | "search";
	disabled?: boolean;
}

export function PlatformIntelligence({
	enabled,
	onEnabledChange,
	itemType,
	disabled = false,
}: PlatformIntelligenceProps) {
	const getContextText = () => {
		switch (itemType) {
			case "campaign":
				return "your past campaigns, conversions, and responses";
			case "workflow":
				return "your workflow executions, success rates, and automation patterns";
			case "search":
				return "your search history, high-performing filters, and conversion data";
			default:
				return "your platform data";
		}
	};

	const getOptimizationText = () => {
		switch (itemType) {
			case "campaign":
				return "AI will analyze your best-performing campaigns, high-converting leads, and successful outreach patterns to optimize this generation";
			case "workflow":
				return "AI will analyze your most efficient workflows, automation success rates, and execution patterns to optimize this generation";
			case "search":
				return "AI will analyze your highest-converting searches, best-performing filters, and lead quality patterns to optimize this generation";
			default:
				return "AI will analyze your platform data to optimize this generation";
		}
	};

	return (
		<div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
			<div className="flex items-start gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
					<Lightbulb className="h-5 w-5 text-primary" />
				</div>
				<div className="flex-1 space-y-2">
					<div className="flex items-center justify-between gap-4">
						<div>
							<Label
								htmlFor="ai-learning"
								className="font-semibold text-foreground text-sm"
							>
								Platform Intelligence
							</Label>
							<p className="mt-0.5 text-muted-foreground text-xs">
								Use {getContextText()} to generate smarter recommendations
							</p>
						</div>
						<Switch
							id="ai-learning"
							checked={enabled}
							onCheckedChange={onEnabledChange}
							disabled={disabled}
						/>
					</div>
					{enabled && (
						<div className="rounded-md bg-muted/50 p-2 text-muted-foreground text-xs">
							✓ {getOptimizationText()}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
