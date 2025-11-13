"use client";

import React, { useMemo, useState } from "react";

import { calculateCommissionSplit, formatCurrency } from "../formulas";
import { CalculatorCard } from "./CalculatorCard";
import type { CalculatorComponentProps } from "../types";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;
const toInputValue = (value: string | number | undefined, fallback = "") =>
	value === undefined || value === null ? fallback : String(value);

export function CommissionSplitCalculator({
	initialValues,
}: CalculatorComponentProps) {
	const [inputs, setInputs] = useState({
		salePrice: toInputValue(initialValues?.salePrice),
		commissionRate: toInputValue(initialValues?.commissionRate, "6"),
		agentSplit: toInputValue(initialValues?.agentSplit, "70"),
		teamFee: toInputValue(initialValues?.teamFee),
	});

	const result = useMemo(
		() =>
			calculateCommissionSplit({
				salePrice: parseNumber(inputs.salePrice),
				commissionRate: parseNumber(inputs.commissionRate),
				agentSplit: parseNumber(inputs.agentSplit),
				teamFee: parseNumber(inputs.teamFee),
			}),
		[inputs],
	);

	return (
		<CalculatorCard
			id="commission-split"
			title="Commission Split Calculator"
			description="Break down deal commissions across agents and brokers."
		>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="commission-sale-price"
						className="font-medium text-muted-foreground text-sm"
					>
						Sale Price*
					</label>
					<input
						id="commission-sale-price"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="500000"
						value={inputs.salePrice}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, salePrice: event.target.value }))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="commission-rate"
						className="font-medium text-muted-foreground text-sm"
					>
						Commission Rate (%)
					</label>
					<input
						id="commission-rate"
						type="number"
						min={0}
						step="0.1"
						className="rounded border border-input bg-background p-2 text-sm"
						value={inputs.commissionRate}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								commissionRate: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="commission-agent-split"
						className="font-medium text-muted-foreground text-sm"
					>
						Agent Split (%)
					</label>
					<input
						id="commission-agent-split"
						type="number"
						min={0}
						max={100}
						step="0.1"
						className="rounded border border-input bg-background p-2 text-sm"
						value={inputs.agentSplit}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								agentSplit: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="commission-team-fee"
						className="font-medium text-muted-foreground text-sm"
					>
						Team Fee
					</label>
					<input
						id="commission-team-fee"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="1000"
						value={inputs.teamFee}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, teamFee: event.target.value }))
						}
					/>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Total Commission
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.totalCommission)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Agent Commission
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.agentCommission)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Broker Commission
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.brokerCommission)}
					</p>
				</div>
			</div>
		</CalculatorCard>
	);
}
