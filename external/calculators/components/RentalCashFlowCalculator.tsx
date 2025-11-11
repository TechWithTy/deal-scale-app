"use client";

import React, { useMemo, useState } from "react";

import {
	calculateRentalCashFlow,
	formatCurrency,
	formatPercent,
} from "../formulas";
import { CalculatorCard } from "./CalculatorCard";
import type { CalculatorComponentProps } from "../types";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;
const toInputValue = (value: string | number | undefined) =>
	value === undefined || value === null ? "" : String(value);

export function RentalCashFlowCalculator({
	initialValues,
}: CalculatorComponentProps) {
	const [inputs, setInputs] = useState({
		monthlyRent: toInputValue(initialValues?.monthlyRent),
		vacancyRate: toInputValue(initialValues?.vacancyRate),
		monthlyExpenses: toInputValue(initialValues?.monthlyExpenses),
		loanPayment: toInputValue(initialValues?.loanPayment),
		propertyValue: toInputValue(initialValues?.propertyValue),
		downPayment: toInputValue(initialValues?.downPayment),
	});

	const result = useMemo(() => {
		return calculateRentalCashFlow({
			monthlyRent: parseNumber(inputs.monthlyRent),
			vacancyRate: parseNumber(inputs.vacancyRate),
			monthlyExpenses: parseNumber(inputs.monthlyExpenses),
			loanPayment: parseNumber(inputs.loanPayment),
			propertyValue: parseNumber(inputs.propertyValue),
			downPayment: parseNumber(inputs.downPayment),
		});
	}, [inputs]);

	return (
		<CalculatorCard
			id="rental-cashflow"
			title="Rental Cash Flow Calculator"
			description="Measure rental cash flow, cap rate, and cash-on-cash return."
		>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="rental-monthly-rent"
						className="font-medium text-muted-foreground text-sm"
					>
						Monthly Rent*
					</label>
					<input
						id="rental-monthly-rent"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="2500"
						value={inputs.monthlyRent}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								monthlyRent: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="rental-vacancy-rate"
						className="font-medium text-muted-foreground text-sm"
					>
						Vacancy Rate (%)*
					</label>
					<input
						id="rental-vacancy-rate"
						type="number"
						min={0}
						step="0.1"
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="5"
						value={inputs.vacancyRate}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								vacancyRate: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="rental-monthly-expenses"
						className="font-medium text-muted-foreground text-sm"
					>
						Monthly Expenses*
					</label>
					<input
						id="rental-monthly-expenses"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="800"
						value={inputs.monthlyExpenses}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								monthlyExpenses: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="rental-loan-payment"
						className="font-medium text-muted-foreground text-sm"
					>
						Loan Payment*
					</label>
					<input
						id="rental-loan-payment"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="900"
						value={inputs.loanPayment}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								loanPayment: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="rental-property-value"
						className="font-medium text-muted-foreground text-sm"
					>
						Property Value*
					</label>
					<input
						id="rental-property-value"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="320000"
						value={inputs.propertyValue}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								propertyValue: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="rental-down-payment"
						className="font-medium text-muted-foreground text-sm"
					>
						Down Payment*
					</label>
					<input
						id="rental-down-payment"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="64000"
						value={inputs.downPayment}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								downPayment: event.target.value,
							}))
						}
					/>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Effective Rent
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.effectiveRent)}
					</p>
				</div>

				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Monthly Cash Flow
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.monthlyCashFlow)}
					</p>
				</div>

				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Annual Cash Flow
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.annualCashFlow)}
					</p>
				</div>

				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Cap Rate
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatPercent(result.results.capRate)}
					</p>
				</div>

				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Cash-on-Cash Return
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatPercent(result.results.cashOnCashReturn)}
					</p>
				</div>
			</div>
		</CalculatorCard>
	);
}
