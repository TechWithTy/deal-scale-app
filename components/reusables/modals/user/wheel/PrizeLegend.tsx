/**
 * Prize Legend Component
 * Displays all available prizes with their icons and win probabilities
 */

import { Card } from "@/components/ui/card";
import type { Prize } from "@/external/wheel-spinner/types";

interface PrizeLegendProps {
	prizes: Prize[];
}

export function PrizeLegend({ prizes }: PrizeLegendProps) {
	return (
		<Card className="w-full border bg-muted/50 p-3">
			<div className="mb-3 text-center">
				<h3 className="font-semibold text-sm">Available Prizes</h3>
				<p className="text-muted-foreground text-xs">What you can win today</p>
			</div>

			<div className="grid gap-1.5 sm:grid-cols-2">
				{prizes.map((prize) => (
					<div
						key={prize.id}
						className="flex items-center gap-2 rounded-md bg-background/50 px-2 py-1.5 text-xs"
					>
						<span className="shrink-0 text-base leading-none">
							{prize.icon}
						</span>
						<span className="text-xs">{prize.label}</span>
					</div>
				))}
			</div>

			<div className="mt-2 border-t pt-2 text-center text-[10px] text-muted-foreground">
				{prizes.length} unique prizes available
			</div>
		</Card>
	);
}
