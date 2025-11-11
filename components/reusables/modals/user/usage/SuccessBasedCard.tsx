/**
 * Success-Based Pricing Card Component
 * Displays commission partner model
 */

import type { SuccessBasedTier } from "@/lib/mock/plans";

interface SuccessBasedCardProps {
	tier: SuccessBasedTier;
	onSelect: () => void;
}

export function SuccessBasedCard({ tier, onSelect }: SuccessBasedCardProps) {
	return (
		<div className="rounded-lg border-2 border-primary bg-primary/5 p-6 shadow-lg">
			<div className="mb-4">
				<h3 className="mb-2 font-bold text-2xl text-foreground">{tier.name}</h3>
				<p className="text-muted-foreground text-sm">{tier.type}</p>
			</div>

			<div className="mb-6">
				<p className="mb-4 font-semibold text-foreground text-lg">
					{tier.structure}
				</p>
			</div>

			<div className="mb-6">
				<h4 className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
					PERKS
				</h4>
				<ul className="space-y-2.5">
					{tier.perks.map((perk, index) => (
						<li
							key={`${tier.id}-perk-${index}`}
							className="flex items-start gap-2.5"
						>
							<span className="mt-0.5 font-semibold text-green-600 text-lg leading-none">
								✔
							</span>
							<span className="text-foreground text-sm">{perk}</span>
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
				className="w-full rounded-lg bg-primary py-3 font-semibold text-lg text-primary-foreground transition-all hover:bg-primary/90"
			>
				Apply for Partnership
			</button>
		</div>
	);
}
