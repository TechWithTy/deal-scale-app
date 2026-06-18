"use client";

import React, { useMemo, useState } from "react";

import { formatCurrency, formatPercent } from "../formulas";
import type { CalculatorComponentProps } from "../types";
import { CalculatorCard } from "./CalculatorCard";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;
const toInputValue = (value: string | number | undefined) =>
	value === undefined || value === null ? "" : String(value);
const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

export function CashBuyerBuyBoxScorer({
	initialValues,
}: CalculatorComponentProps) {
	const [inputs, setInputs] = useState({
		offerPrice: toInputValue(initialValues?.offerPrice),
		arv: toInputValue(initialValues?.arv),
		repairBudget: toInputValue(initialValues?.repairBudget),
		maxPurchasePrice: toInputValue(initialValues?.maxPurchasePrice),
		minimumSpread: toInputValue(initialValues?.minimumSpread),
		minimumRoi: toInputValue(initialValues?.minimumRoi),
	});

	const result = useMemo(() => {
		const offerPrice = parseNumber(inputs.offerPrice);
		const arv = parseNumber(inputs.arv);
		const repairBudget = parseNumber(inputs.repairBudget);
		const maxPurchasePrice = parseNumber(inputs.maxPurchasePrice);
		const minimumSpread = parseNumber(inputs.minimumSpread);
		const minimumRoi = parseNumber(inputs.minimumRoi);

		const totalCost = offerPrice + repairBudget;
		const spread = arv - totalCost;
		const roi = totalCost > 0 ? (spread / totalCost) * 100 : 0;
		const offerScore =
			maxPurchasePrice > 0
				? clamp(
						100 -
							(Math.max(offerPrice - maxPurchasePrice, 0) / maxPurchasePrice) *
								200,
						0,
						100,
					)
				: offerPrice > 0
					? 100
					: 0;
		const spreadScore =
			minimumSpread > 0 ? clamp((spread / minimumSpread) * 100, 0, 100) : 0;
		const roiScore =
			minimumRoi > 0 ? clamp((roi / minimumRoi) * 100, 0, 100) : 0;
		const buyBoxScore = Math.round(
			offerScore * 0.4 + spreadScore * 0.35 + roiScore * 0.25,
		);

		return {
			offerPrice,
			arv,
			repairBudget,
			totalCost,
			spread,
			roi,
			buyBoxScore,
			passes:
				(maxPurchasePrice === 0 || offerPrice <= maxPurchasePrice) &&
				(minimumSpread === 0 || spread >= minimumSpread) &&
				(minimumRoi === 0 || roi >= minimumRoi),
		};
	}, [inputs]);

	return (
		<CalculatorCard
			id="cash-buyer-buy-box"
			title="Cash Buyer Buy Box Scorer"
			description="Score a property against a cash buyer buy box and see whether the deal clears your target spread and ROI."
		>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="buybox-offer"
						className="font-medium text-muted-foreground text-sm"
					>
						Offer Price*
					</label>
					<input
						id="buybox-offer"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="220000"
						value={inputs.offerPrice}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, offerPrice: event.target.value }))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="buybox-arv"
						className="font-medium text-muted-foreground text-sm"
					>
						ARV*
					</label>
					<input
						id="buybox-arv"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="300000"
						value={inputs.arv}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, arv: event.target.value }))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="buybox-repairs"
						className="font-medium text-muted-foreground text-sm"
					>
						Repair Budget*
					</label>
					<input
						id="buybox-repairs"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="35000"
						value={inputs.repairBudget}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								repairBudget: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="buybox-max"
						className="font-medium text-muted-foreground text-sm"
					>
						Max Purchase Price*
					</label>
					<input
						id="buybox-max"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="210000"
						value={inputs.maxPurchasePrice}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								maxPurchasePrice: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="buybox-spread"
						className="font-medium text-muted-foreground text-sm"
					>
						Minimum Spread*
					</label>
					<input
						id="buybox-spread"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="45000"
						value={inputs.minimumSpread}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								minimumSpread: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="buybox-roi"
						className="font-medium text-muted-foreground text-sm"
					>
						Minimum ROI %
					</label>
					<input
						id="buybox-roi"
						type="number"
						min={0}
						step="0.1"
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="20"
						value={inputs.minimumRoi}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, minimumRoi: event.target.value }))
						}
					/>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-4">
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Buy Box Score
					</p>
					<p className="font-semibold text-2xl text-foreground">
						{result.buyBoxScore}/100
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Deal Spread
					</p>
					<p className="font-semibold text-foreground text-lg">
						{formatCurrency(result.spread)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						ROI
					</p>
					<p className="font-semibold text-foreground text-lg">
						{formatPercent(result.roi)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Buy Box Status
					</p>
					<p className="font-semibold text-foreground text-lg">
						{result.passes ? "Pass" : "Review"}
					</p>
				</div>
			</div>
		</CalculatorCard>
	);
}
