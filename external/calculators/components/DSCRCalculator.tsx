"use client";

import React, { useMemo, useState } from "react";

import { calculateDSCR } from "../formulas";
import { CalculatorCard } from "./CalculatorCard";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;

export function DSCRCalculator() {
	const [inputs, setInputs] = useState({
		noi: "",
		annualDebtService: "",
	});

	const result = useMemo(
		() =>
			calculateDSCR({
				noi: parseNumber(inputs.noi),
				annualDebtService: parseNumber(inputs.annualDebtService),
			}),
		[inputs],
	);

	return (
		<CalculatorCard
			id="dscr"
			title="DSCR Calculator"
			description="Evaluate the debt service coverage ratio for income-producing assets."
		>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="dscr-noi"
						className="font-medium text-muted-foreground text-sm"
					>
						Net Operating Income (Annual)*
					</label>
					<input
						id="dscr-noi"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="120000"
						value={inputs.noi}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, noi: event.target.value }))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="dscr-debt"
						className="font-medium text-muted-foreground text-sm"
					>
						Annual Debt Service*
					</label>
					<input
						id="dscr-debt"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="80000"
						value={inputs.annualDebtService}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								annualDebtService: event.target.value,
							}))
						}
					/>
				</div>
			</div>

			<div className="rounded border border-border bg-background p-4">
				<p className="text-muted-foreground text-xs uppercase tracking-wide">
					DSCR
				</p>
				<p className="font-semibold text-lg text-foreground">
					{result.results.dscr.toFixed(2)}
				</p>
			</div>
		</CalculatorCard>
	);
}
