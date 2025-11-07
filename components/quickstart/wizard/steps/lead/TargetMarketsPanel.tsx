"use client";

import { useState } from "react";
import { shallow } from "zustand/shallow";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";

const TargetMarketsPanel = () => {
	const [marketDraft, setMarketDraft] = useState("");

	const { targetMarkets, addTargetMarket, removeTargetMarket } =
		useQuickStartWizardDataStore(
			(state) => ({
				targetMarkets: state.targetMarkets,
				addTargetMarket: state.addTargetMarket,
				removeTargetMarket: state.removeTargetMarket,
			}),
			shallow,
		);

	const handleSubmit = () => {
		const trimmed = marketDraft.trim();
		if (!trimmed) {
			return;
		}

		addTargetMarket(trimmed);
		setMarketDraft("");
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Target Markets</CardTitle>
				<CardDescription>
					Add ZIP codes, cities, or custom market tags to scope the campaign.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Input
						data-testid="lead-intake-market-input"
						placeholder="e.g. 94107 or Austin, TX"
						value={marketDraft}
						onChange={(event) => setMarketDraft(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								handleSubmit();
							}
						}}
						className="sm:max-w-xs"
					/>
					<Button type="button" variant="secondary" onClick={handleSubmit}>
						Add Market
					</Button>
				</div>
				<p className="text-muted-foreground text-xs">
					Press Enter after typing a value or use the add button to include it.
				</p>
				<div className="flex flex-wrap gap-2">
					{targetMarkets.map((market) => (
						<Badge
							key={market}
							variant="secondary"
							className="flex items-center gap-2"
						>
							{market}
							<button
								type="button"
								className="rounded-full border px-1 font-semibold text-[10px] leading-none"
								onClick={() => removeTargetMarket(market)}
								aria-label={`Remove ${market}`}
							>
								×
							</button>
						</Badge>
					))}
					{targetMarkets.length === 0 && (
						<span className="text-muted-foreground text-xs">
							No markets added yet.
						</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default TargetMarketsPanel;
