/**
 * One-Time Pricing Card Component
 * Displays pay-per-lead model
 */

import type { OneTimeTier } from "@/lib/mock/plans";

interface OneTimeCardProps {
	tier: OneTimeTier;
	onSelect: () => void;
}

export function OneTimeCard({ tier, onSelect }: OneTimeCardProps) {
	return (
		<div className="rounded-lg border-2 border-border bg-card p-6 hover:border-primary/50">
			<div className="mb-4">
				<h3 className="mb-2 font-bold text-2xl text-foreground">{tier.name}</h3>
				<p className="text-muted-foreground text-sm">{tier.type}</p>
			</div>

			<div className="mb-6">
				<div className="mb-2 flex items-baseline gap-2">
					<span className="font-bold text-3xl text-foreground">
						${tier.price.toLocaleString()}
					</span>
					<span className="font-medium text-base text-muted-foreground">
						{tier.unit}
					</span>
				</div>
			</div>

			<div className="mb-6">
				<h4 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
					CONDITIONS
				</h4>
				<ul className="space-y-2.5">
					{tier.conditions.map((condition, index) => (
						<li
							key={`${tier.id}-condition-${index}`}
							className="flex items-start gap-2.5"
						>
							<span className="text-muted-foreground text-xs">•</span>
							<span className="text-foreground text-sm">{condition}</span>
						</li>
					))}
				</ul>
			</div>

			{tier.notes && (
				<div className="mb-6 rounded-md bg-muted/50 p-3">
					<p className="text-muted-foreground text-xs italic">{tier.notes}</p>
				</div>
			)}

			<button
				type="button"
				onClick={onSelect}
				className="w-full rounded-lg border-2 border-primary bg-transparent py-3 font-semibold text-lg text-primary transition-all hover:bg-primary/10"
			>
				Get Started
			</button>
		</div>
	);
}
