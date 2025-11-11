"use client";

import React, { useMemo, useState } from "react";

import { calculateLTV, formatPercent } from "../formulas";
import { CalculatorCard } from "./CalculatorCard";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;

export function LTVCalculator() {
	const [inputs, setInputs] = useState({
		loanAmount: "",
		propertyValue: "",
	});

	const result = useMemo(
		() =>
			calculateLTV({
				loanAmount: parseNumber(inputs.loanAmount),
				propertyValue: parseNumber(inputs.propertyValue),
			}),
		[inputs],
	);

	return (
		<CalculatorCard
			id="ltv"
			title="Loan-to-Value Calculator"
			description="Quickly compute LTV for underwriting and financing scenarios."
		>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="ltv-loan"
						className="font-medium text-muted-foreground text-sm"
					>
						Loan Amount*
					</label>
					<input
						id="ltv-loan"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="180000"
						value={inputs.loanAmount}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, loanAmount: event.target.value }))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="ltv-value"
						className="font-medium text-muted-foreground text-sm"
					>
						Property Value*
					</label>
					<input
						id="ltv-value"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="300000"
						value={inputs.propertyValue}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								propertyValue: event.target.value,
							}))
						}
					/>
				</div>
			</div>

			<div className="rounded border border-border bg-background p-4">
				<p className="text-muted-foreground text-xs uppercase tracking-wide">
					LTV
				</p>
				<p className="font-semibold text-lg text-foreground">
					{formatPercent(result.results.ltvPercent)}
				</p>
			</div>
		</CalculatorCard>
	);
}
