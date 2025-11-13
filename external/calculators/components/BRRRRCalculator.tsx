"use client";

import React, { useMemo, useState } from "react";

import { calculateBRRRR, formatCurrency, formatPercent } from "../formulas";
import { CalculatorCard } from "./CalculatorCard";
import type { CalculatorComponentProps } from "../types";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;
const toInputValue = (value: string | number | undefined, fallback = "") =>
	value === undefined || value === null ? fallback : String(value);

export function BRRRRCalculator({ initialValues }: CalculatorComponentProps) {
	const [inputs, setInputs] = useState({
		purchasePrice: toInputValue(initialValues?.purchasePrice),
		rehabCost: toInputValue(initialValues?.rehabCost),
		rent: toInputValue(initialValues?.rent),
		arv: toInputValue(initialValues?.arv),
		refinanceLTV: toInputValue(initialValues?.refinanceLTV, "75"),
		loanRate: toInputValue(initialValues?.loanRate, "6.5"),
		termYears: toInputValue(initialValues?.termYears, "30"),
		closingCosts: toInputValue(initialValues?.closingCosts),
	});

	const result = useMemo(
		() =>
			calculateBRRRR({
				purchasePrice: parseNumber(inputs.purchasePrice),
				rehabCost: parseNumber(inputs.rehabCost),
				rent: parseNumber(inputs.rent),
				arv: parseNumber(inputs.arv),
				refinanceLTV: parseNumber(inputs.refinanceLTV),
				loanRate: parseNumber(inputs.loanRate),
				termYears: parseNumber(inputs.termYears),
				closingCosts: parseNumber(inputs.closingCosts),
			}),
		[inputs],
	);

	return (
		<CalculatorCard
			id="brrrr"
			title="BRRRR Calculator"
			description="Analyze buy-rehab-rent-refinance-repeat scenarios."
		>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="brrrr-purchase-price"
						className="font-medium text-muted-foreground text-sm"
					>
						Purchase Price*
					</label>
					<input
						id="brrrr-purchase-price"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="120000"
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
						htmlFor="brrrr-rehab-cost"
						className="font-medium text-muted-foreground text-sm"
					>
						Rehab Cost*
					</label>
					<input
						id="brrrr-rehab-cost"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="40000"
						value={inputs.rehabCost}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, rehabCost: event.target.value }))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="brrrr-rent"
						className="font-medium text-muted-foreground text-sm"
					>
						Monthly Rent*
					</label>
					<input
						id="brrrr-rent"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="1800"
						value={inputs.rent}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, rent: event.target.value }))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="brrrr-arv"
						className="font-medium text-muted-foreground text-sm"
					>
						After Repair Value (ARV)*
					</label>
					<input
						id="brrrr-arv"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="250000"
						value={inputs.arv}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, arv: event.target.value }))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="brrrr-ltv"
						className="font-medium text-muted-foreground text-sm"
					>
						Refinance LTV (%)
					</label>
					<input
						id="brrrr-ltv"
						type="number"
						min={0}
						max={100}
						className="rounded border border-input bg-background p-2 text-sm"
						value={inputs.refinanceLTV}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								refinanceLTV: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="brrrr-loan-rate"
						className="font-medium text-muted-foreground text-sm"
					>
						Loan Rate (%)
					</label>
					<input
						id="brrrr-loan-rate"
						type="number"
						min={0}
						step="0.01"
						className="rounded border border-input bg-background p-2 text-sm"
						value={inputs.loanRate}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, loanRate: event.target.value }))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="brrrr-term"
						className="font-medium text-muted-foreground text-sm"
					>
						Term (Years)
					</label>
					<input
						id="brrrr-term"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						value={inputs.termYears}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, termYears: event.target.value }))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="brrrr-closing-costs"
						className="font-medium text-muted-foreground text-sm"
					>
						Closing Costs*
					</label>
					<input
						id="brrrr-closing-costs"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="8000"
						value={inputs.closingCosts}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								closingCosts: event.target.value,
							}))
						}
					/>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Cash Out
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.cashOut)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Retained Equity
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.retainedEquity)}
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
						Monthly Payment
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.monthlyPayment)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						NOI
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.noi)}
					</p>
				</div>
			</div>
		</CalculatorCard>
	);
}
