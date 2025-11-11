"use client";

import React, { useMemo, useState } from "react";

import {
	calculateFixFlipROI,
	formatCurrency,
	formatPercent,
} from "../formulas";
import { CalculatorCard } from "./CalculatorCard";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;

export function FixFlipROICalculator() {
	const [inputs, setInputs] = useState({
		arv: "",
		purchasePrice: "",
		rehabCost: "",
		holdingCost: "",
		sellingFees: "",
	});

	const result = useMemo(() => {
		return calculateFixFlipROI({
			arv: parseNumber(inputs.arv),
			purchasePrice: parseNumber(inputs.purchasePrice),
			rehabCost: parseNumber(inputs.rehabCost),
			holdingCost: parseNumber(inputs.holdingCost),
			sellingFees: parseNumber(inputs.sellingFees),
		});
	}, [inputs]);

	return (
		<CalculatorCard
			id="fix-flip-roi"
			title="Fix & Flip ROI Calculator"
			description="Model the projected profit and ROI for a fix & flip deal."
		>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="fixflip-arv"
						className="font-medium text-muted-foreground text-sm"
					>
						After Repair Value (ARV)*
					</label>
					<input
						id="fixflip-arv"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="350000"
						value={inputs.arv}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, arv: event.target.value }))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="fixflip-purchase"
						className="font-medium text-muted-foreground text-sm"
					>
						Purchase Price*
					</label>
					<input
						id="fixflip-purchase"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="200000"
						value={inputs.purchasePrice}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								purchasePrice: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="fixflip-rehab"
						className="font-medium text-muted-foreground text-sm"
					>
						Rehab Cost*
					</label>
					<input
						id="fixflip-rehab"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="50000"
						value={inputs.rehabCost}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, rehabCost: event.target.value }))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="fixflip-holding"
						className="font-medium text-muted-foreground text-sm"
					>
						Holding Cost*
					</label>
					<input
						id="fixflip-holding"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="15000"
						value={inputs.holdingCost}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								holdingCost: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2 md:col-span-2">
					<label
						htmlFor="fixflip-selling-fees"
						className="font-medium text-muted-foreground text-sm"
					>
						Selling Fees*
					</label>
					<input
						id="fixflip-selling-fees"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="20000"
						value={inputs.sellingFees}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								sellingFees: event.target.value,
							}))
						}
					/>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-2">
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Projected Profit
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.profit)}
					</p>
				</div>

				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						ROI
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatPercent(result.results.roiPercent)}
					</p>
				</div>

				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Total Investment
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.totalInvestment)}
					</p>
				</div>

				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Break-even ARV
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.breakEvenARV)}
					</p>
				</div>
			</div>
		</CalculatorCard>
	);
}
