"use client";

import React, { useMemo, useState } from "react";

import { formatCurrency } from "../formulas";
import type { CalculatorComponentProps } from "../types";
import { CalculatorCard } from "./CalculatorCard";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;
const toInputValue = (value: string | number | undefined) =>
	value === undefined || value === null ? "" : String(value);

export function OffMarketMAOCalculator({
	initialValues,
}: CalculatorComponentProps) {
	const [inputs, setInputs] = useState({
		arv: toInputValue(initialValues?.arv),
		repairCosts: toInputValue(initialValues?.repairCosts),
		dispositionCosts: toInputValue(initialValues?.dispositionCosts),
		targetProfit: toInputValue(initialValues?.targetProfit),
		minSellerNet: toInputValue(initialValues?.minSellerNet),
	});

	const result = useMemo(() => {
		const arv = parseNumber(inputs.arv);
		const repairCosts = parseNumber(inputs.repairCosts);
		const dispositionCosts = parseNumber(inputs.dispositionCosts);
		const targetProfit = parseNumber(inputs.targetProfit);
		const minSellerNet = parseNumber(inputs.minSellerNet);

		const investorMao = Math.max(
			0,
			arv * 0.7 - repairCosts - dispositionCosts - targetProfit,
		);
		const sellerNetCeiling = Math.max(0, minSellerNet + dispositionCosts);
		const recommendedOffer = Math.max(
			0,
			Math.min(investorMao, sellerNetCeiling),
		);
		const estimatedSellerNet = Math.max(0, recommendedOffer - dispositionCosts);

		return {
			arv,
			repairCosts,
			dispositionCosts,
			targetProfit,
			minSellerNet,
			investorMao,
			sellerNetCeiling,
			recommendedOffer,
			estimatedSellerNet,
		};
	}, [inputs]);

	return (
		<CalculatorCard
			id="off-market-mao"
			title="Off-Market MAO Calculator"
			description="Set a seller-facing net target while keeping the investor MAO constraints visible."
		>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="mao-arv"
						className="font-medium text-muted-foreground text-sm"
					>
						ARV*
					</label>
					<input
						id="mao-arv"
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
						htmlFor="mao-repair"
						className="font-medium text-muted-foreground text-sm"
					>
						Repair Costs*
					</label>
					<input
						id="mao-repair"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="35000"
						value={inputs.repairCosts}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								repairCosts: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="mao-disposition"
						className="font-medium text-muted-foreground text-sm"
					>
						Disposition Costs*
					</label>
					<input
						id="mao-disposition"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="8500"
						value={inputs.dispositionCosts}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								dispositionCosts: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="mao-profit"
						className="font-medium text-muted-foreground text-sm"
					>
						Target Profit*
					</label>
					<input
						id="mao-profit"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="25000"
						value={inputs.targetProfit}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								targetProfit: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2 md:col-span-2">
					<label
						htmlFor="mao-min-net"
						className="font-medium text-muted-foreground text-sm"
					>
						Minimum Seller Net Proceeds*
					</label>
					<input
						id="mao-min-net"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="180000"
						value={inputs.minSellerNet}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								minSellerNet: event.target.value,
							}))
						}
					/>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Recommended Offer
					</p>
					<p className="font-semibold text-foreground text-lg">
						{formatCurrency(result.recommendedOffer)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Investor MAO Ceiling
					</p>
					<p className="font-semibold text-foreground text-lg">
						{formatCurrency(result.investorMao)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Estimated Seller Net
					</p>
					<p className="font-semibold text-foreground text-lg">
						{formatCurrency(result.estimatedSellerNet)}
					</p>
				</div>
			</div>
		</CalculatorCard>
	);
}
