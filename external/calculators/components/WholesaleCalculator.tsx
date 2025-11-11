"use client";

import React, { useMemo, useState } from "react";

import { cn } from "@/lib/_utils";

import { CalculatorCard } from "./CalculatorCard";

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

const PROFIT_MARGIN_OPTIONS = [
	{ label: "70%", value: 0.7 },
	{ label: "75%", value: 0.75 },
	{ label: "80%", value: 0.8 },
];

export function WholesaleCalculator() {
	const [afterRepairValue, setAfterRepairValue] = useState<string>("");
	const [repairCost, setRepairCost] = useState<string>("");
	const [assignmentFee, setAssignmentFee] = useState<string>("");
	const [profitMargin, setProfitMargin] = useState<number>(0.7);

	const maxAllowableOffer = useMemo(() => {
		const arv = Number(afterRepairValue);
		const repairs = Number(repairCost);
		const fee = Number(assignmentFee);

		if (!arv || (!repairs && repairs !== 0) || (!fee && fee !== 0)) {
			return 0;
		}

		const offer = arv * profitMargin - repairs - fee;
		return offer > 0 ? offer : 0;
	}, [afterRepairValue, assignmentFee, profitMargin, repairCost]);

	return (
		<CalculatorCard
			id="wholesale"
			title="Wholesale Calculator"
			description="Determine the maximum allowable offer (MAO) for a wholesale deal based on your desired margin."
		>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="wholesale-arv"
						className="text-muted-foreground text-sm font-medium"
					>
						After Repair Value (ARV)*
					</label>
					<input
						id="wholesale-arv"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="Enter the ARV"
						value={afterRepairValue}
						onChange={(event) => setAfterRepairValue(event.target.value)}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="wholesale-repairs"
						className="text-muted-foreground text-sm font-medium"
					>
						Cost of Repairs*
					</label>
					<input
						id="wholesale-repairs"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="Enter the repairs"
						value={repairCost}
						onChange={(event) => setRepairCost(event.target.value)}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="wholesale-assignment-fee"
						className="text-muted-foreground text-sm font-medium"
					>
						Assignment Fee*
					</label>
					<input
						id="wholesale-assignment-fee"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="Enter the assignment fee"
						value={assignmentFee}
						onChange={(event) => setAssignmentFee(event.target.value)}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="wholesale-profit-margin"
						className="text-muted-foreground text-sm font-medium"
					>
						Profit Margin*
					</label>
					<select
						id="wholesale-profit-margin"
						className={cn(
							"rounded border border-input bg-background p-2 text-sm transition-colors",
						)}
						value={profitMargin}
						onChange={(event) => setProfitMargin(Number(event.target.value))}
					>
						{PROFIT_MARGIN_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="flex flex-col items-end gap-1">
				<span className="text-muted-foreground text-sm">
					Max Allowable Offer (MAO)
				</span>
				<span className="font-semibold text-2xl text-foreground">
					{currencyFormatter.format(maxAllowableOffer)}
				</span>
			</div>
		</CalculatorCard>
	);
}
