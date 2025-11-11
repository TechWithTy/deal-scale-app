"use client";

import React, { useMemo, useState } from "react";

import {
	compareDeals,
	type DealComparisonInput,
	formatPercent,
} from "../formulas";
import { CalculatorCard } from "./CalculatorCard";

type DealInput = DealComparisonInput[number];

const defaultDeals: DealInput[] = [
	{
		id: "deal-a",
		arv: 320_000,
		cost: 190_000,
		rent: 2_400,
		cashFlow: 7_000,
		roiPercent: 25,
		capRate: 7,
	},
	{
		id: "deal-b",
		arv: 340_000,
		cost: 210_000,
		rent: 2_600,
		cashFlow: 9_000,
		roiPercent: 18,
		capRate: 9,
	},
	{
		id: "deal-c",
		arv: 300_000,
		cost: 180_000,
		rent: 2_500,
		cashFlow: 8_500,
		roiPercent: 22,
		capRate: 8,
	},
];

const parseNumber = (value: string) => Number.parseFloat(value) || 0;

export function DealComparisonCalculator() {
	const [deals, setDeals] = useState(defaultDeals);

	const ranked = useMemo(() => compareDeals(deals), [deals]);

	const updateDeal = (index: number, field: keyof DealInput, value: string) => {
		setDeals((prev) => {
			const next = [...prev];
			const deal = { ...next[index] };
			if (field === "id") {
				deal.id = value;
			} else {
				deal[field] = parseNumber(value) as DealInput[typeof field];
			}
			next[index] = deal;
			return next;
		});
	};

	const addDeal = () => {
		setDeals((prev) => [
			...prev,
			{
				id: `deal-${prev.length + 1}`,
				arv: 0,
				cost: 0,
				rent: 0,
				cashFlow: 0,
				roiPercent: 0,
				capRate: 0,
			},
		]);
	};

	const removeDeal = (index: number) => {
		setDeals((prev) => prev.filter((_, idx) => idx !== index));
	};

	return (
		<CalculatorCard
			id="deal-comparison"
			title="Deal Comparison Calculator"
			description="Benchmark multiple deals by ROI, cap rate, and cash flow efficiency."
		>
			<div className="grid gap-4">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[640px] border-collapse text-sm">
						<thead>
							<tr className="text-muted-foreground text-xs uppercase tracking-wide">
								<th className="border-b border-border pb-2 text-left">
									Deal ID
								</th>
								<th className="border-b border-border pb-2 text-right">Cost</th>
								<th className="border-b border-border pb-2 text-right">ARV</th>
								<th className="border-b border-border pb-2 text-right">
									Rent (Monthly)
								</th>
								<th className="border-b border-border pb-2 text-right">
									Annual Cash Flow
								</th>
								<th className="border-b border-border pb-2 text-right">
									ROI %
								</th>
								<th className="border-b border-border pb-2 text-right">
									Cap Rate %
								</th>
								<th className="border-b border-border pb-2" />
							</tr>
						</thead>
						<tbody>
							{deals.map((deal, index) => (
								<tr key={deal.id} className="border-b border-border">
									<td className="py-2 pr-2">
										<input
											aria-label={`Deal ${index + 1} identifier`}
											className="w-full rounded border border-input bg-background p-2 text-sm"
											value={deal.id}
											onChange={(event) =>
												updateDeal(index, "id", event.target.value)
											}
										/>
									</td>
									<td className="py-2">
										<input
											aria-label={`Deal ${deal.id} cost`}
											type="number"
											className="w-full rounded border border-input bg-background p-2 text-right text-sm"
											value={deal.cost}
											onChange={(event) =>
												updateDeal(index, "cost", event.target.value)
											}
										/>
									</td>
									<td className="py-2">
										<input
											aria-label={`Deal ${deal.id} ARV`}
											type="number"
											className="w-full rounded border border-input bg-background p-2 text-right text-sm"
											value={deal.arv}
											onChange={(event) =>
												updateDeal(index, "arv", event.target.value)
											}
										/>
									</td>
									<td className="py-2">
										<input
											aria-label={`Deal ${deal.id} rent`}
											type="number"
											className="w-full rounded border border-input bg-background p-2 text-right text-sm"
											value={deal.rent}
											onChange={(event) =>
												updateDeal(index, "rent", event.target.value)
											}
										/>
									</td>
									<td className="py-2">
										<input
											aria-label={`Deal ${deal.id} cash flow`}
											type="number"
											className="w-full rounded border border-input bg-background p-2 text-right text-sm"
											value={deal.cashFlow}
											onChange={(event) =>
												updateDeal(index, "cashFlow", event.target.value)
											}
										/>
									</td>
									<td className="py-2">
										<input
											aria-label={`Deal ${deal.id} ROI percent`}
											type="number"
											className="w-full rounded border border-input bg-background p-2 text-right text-sm"
											value={deal.roiPercent}
											onChange={(event) =>
												updateDeal(index, "roiPercent", event.target.value)
											}
										/>
									</td>
									<td className="py-2">
										<input
											aria-label={`Deal ${deal.id} cap rate`}
											type="number"
											className="w-full rounded border border-input bg-background p-2 text-right text-sm"
											value={deal.capRate}
											onChange={(event) =>
												updateDeal(index, "capRate", event.target.value)
											}
										/>
									</td>
									<td className="py-2 text-right">
										<button
											type="button"
											className="text-muted-foreground text-xs underline"
											onClick={() => removeDeal(index)}
											disabled={deals.length <= 1}
										>
											Remove
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div>
					<button
						type="button"
						className="rounded border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
						onClick={addDeal}
						disabled={deals.length >= 6}
					>
						Add Deal
					</button>
				</div>
			</div>

			<div className="space-y-3">
				<h3 className="font-semibold text-base text-foreground">
					Ranked Deals
				</h3>
				<ol className="grid gap-3 md:grid-cols-3">
					{ranked.results.map((deal, index) => (
						<li
							key={`${deal.id}-rank`}
							className="rounded border border-border bg-background p-4"
						>
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								#{index + 1} • {deal.id}
							</p>
							<p className="font-semibold text-lg text-foreground">
								Efficiency Score: {deal.efficiencyScore.toFixed(2)}
							</p>
							<div className="mt-2 space-y-1 text-sm text-muted-foreground">
								<p>ROI: {formatPercent(deal.roiPercent)}</p>
								<p>Cap Rate: {formatPercent(deal.capRate)}</p>
								<p>
									Cash Flow / Cost:{" "}
									{formatPercent(
										(deal.cashFlow / Math.max(deal.cost || 1, 1)) * 100,
									)}
								</p>
							</div>
						</li>
					))}
				</ol>
			</div>
		</CalculatorCard>
	);
}
