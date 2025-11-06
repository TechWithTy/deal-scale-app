/**
 * Cost Summary Component
 * Displays credit cost breakdown for lead generation
 * @module lookalike/components
 */

"use client";

import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";
import type { FormValues } from "../types";

interface CostSummaryProps {
	values: FormValues;
}

/**
 * Calculates and displays credit costs
 * Shows lead credits, skip trace credits, and total
 */
export function CostSummary({ values }: CostSummaryProps) {
	const targetSize = values.targetSize || 0;
	const isEnriched =
		values.enrichmentLevel === "premium" || values.enrichmentLevel === "hybrid";
	const totalCredits = targetSize * (isEnriched ? 2 : 1);

	return (
		<div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4 space-y-2">
			<div className="flex items-center gap-2 mb-2">
				<TrendingUp className="h-4 w-4 text-blue-600" />
				<Label className="text-sm font-semibold">Credit Cost Summary</Label>
			</div>

			<div className="space-y-1.5 text-sm">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground">Lead Credits:</span>
					<span className="font-semibold">
						{targetSize} credits
						<span className="text-xs text-muted-foreground ml-1">
							(1 per lead)
						</span>
					</span>
				</div>

				{isEnriched && (
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Skip Trace Credits:</span>
						<span className="font-semibold">
							{targetSize} credits
							<span className="text-xs text-muted-foreground ml-1">
								(1 per lead for {values.enrichmentLevel})
							</span>
						</span>
					</div>
				)}

				<div className="flex items-center justify-between pt-2 border-t">
					<span className="font-semibold">Total Credits:</span>
					<span className="font-bold text-blue-600">
						{totalCredits} credits
					</span>
				</div>
			</div>
		</div>
	);
}
