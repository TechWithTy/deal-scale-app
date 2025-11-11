"use client";

import React, { useMemo, useState } from "react";

import { cn } from "@/lib/_utils";

import { CalculatorCard } from "./CalculatorCard";
import type { CalculatorComponentProps } from "../types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 2,
	minimumFractionDigits: 2,
});

const toInputValue = (value: string | number | undefined) =>
	value === undefined || value === null ? "" : String(value);

export function AmortizationCalculator({
	initialValues,
}: CalculatorComponentProps) {
	const [loanAmount, setLoanAmount] = useState<string>(
		toInputValue(initialValues?.loanAmount),
	);
	const [loanTermYears, setLoanTermYears] = useState<string>(
		toInputValue(initialValues?.loanTermYears),
	);
	const [interestRate, setInterestRate] = useState<string>(
		toInputValue(initialValues?.interestRate),
	);
	const [errorMessage, setErrorMessage] = useState({
		loanTerm: "",
		interestRate: "",
	});

	const monthlyPayment = useMemo(() => {
		const principal = Number(loanAmount);
		const years = Number(loanTermYears);
		const rate = Number(interestRate);

		if (!principal || !years || !rate) {
			return 0;
		}

		const monthlyRate = rate / 100 / 12;
		const numberOfPayments = years * 12;
		const numerator =
			principal * monthlyRate * (1 + monthlyRate) ** numberOfPayments;
		const denominator = (1 + monthlyRate) ** numberOfPayments - 1;
		const result = numerator / denominator;
		return Number.isFinite(result) ? result : 0;
	}, [interestRate, loanAmount, loanTermYears]);

	return (
		<CalculatorCard
			id="amortization"
			title="Amortization Calculator"
			description="Modify the variables to evaluate the expected monthly mortgage payment for this deal."
		>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="amortization-loan-amount"
						className="font-medium text-muted-foreground text-sm"
					>
						Loan Amount*
					</label>
					<input
						id="amortization-loan-amount"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="Enter the loan amount"
						value={loanAmount}
						onChange={(event) => setLoanAmount(event.target.value)}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="amortization-loan-term"
						className="font-medium text-muted-foreground text-sm"
					>
						Loan Term (Years)*
					</label>
					<input
						id="amortization-loan-term"
						type="number"
						min={0}
						className={cn(
							"rounded border border-input bg-background p-2 text-sm transition-colors",
							errorMessage.loanTerm && "border-destructive",
						)}
						placeholder="Enter number of years"
						value={loanTermYears}
						onChange={(event) => {
							const nextValue = event.target.value;
							setLoanTermYears(nextValue);

							const numericValue = Number(nextValue);
							if (numericValue > 60) {
								setErrorMessage((prev) => ({
									...prev,
									loanTerm: "Loan Term cannot be greater than 60",
								}));
							} else {
								setErrorMessage((prev) => ({ ...prev, loanTerm: "" }));
							}
						}}
					/>
					{Boolean(errorMessage.loanTerm) && (
						<p className="text-destructive text-xs">{errorMessage.loanTerm}</p>
					)}
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="amortization-interest-rate"
						className="font-medium text-muted-foreground text-sm"
					>
						Interest Rate (%)*
					</label>
					<input
						id="amortization-interest-rate"
						type="number"
						min={0}
						step="0.01"
						className={cn(
							"rounded border border-input bg-background p-2 text-sm transition-colors",
							errorMessage.interestRate && "border-destructive",
						)}
						placeholder="Enter the interest rate"
						value={interestRate}
						onChange={(event) => {
							const nextValue = event.target.value;
							setInterestRate(nextValue);

							const numericValue = Number(nextValue);
							if (numericValue > 100) {
								setErrorMessage((prev) => ({
									...prev,
									interestRate: "Interest Rate cannot be greater than 100",
								}));
							} else {
								setErrorMessage((prev) => ({ ...prev, interestRate: "" }));
							}
						}}
					/>
					{Boolean(errorMessage.interestRate) && (
						<p className="text-destructive text-xs">
							{errorMessage.interestRate}
						</p>
					)}
				</div>
			</div>

			<div className="flex flex-col items-end gap-1">
				<span className="text-muted-foreground text-sm">Monthly Payment</span>
				<span className="font-semibold text-2xl text-foreground">
					{currencyFormatter.format(monthlyPayment)}
				</span>
			</div>
		</CalculatorCard>
	);
}
