"use client";

import React, { useMemo, useState } from "react";

import { estimateClosingCosts, formatCurrency } from "../formulas";
import { CalculatorCard } from "./CalculatorCard";
import type { CalculatorComponentProps } from "../types";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;
const toInputValue = (value: string | number | undefined) =>
	value === undefined || value === null ? "" : String(value);

export function ClosingCostCalculator({
	initialValues,
}: CalculatorComponentProps) {
	const [inputs, setInputs] = useState({
		salePrice: toInputValue(initialValues?.salePrice),
		propertyTaxes: toInputValue(initialValues?.propertyTaxes),
		titleFees: toInputValue(initialValues?.titleFees),
		transferTaxRate: toInputValue(initialValues?.transferTaxRate),
		miscFees: toInputValue(initialValues?.miscFees),
	});

	const result = useMemo(
		() =>
			estimateClosingCosts({
				salePrice: parseNumber(inputs.salePrice),
				propertyTaxes: parseNumber(inputs.propertyTaxes),
				titleFees: parseNumber(inputs.titleFees),
				transferTaxRate: parseNumber(inputs.transferTaxRate),
				miscFees: parseNumber(inputs.miscFees),
			}),
		[inputs],
	);

	return (
		<CalculatorCard
			id="closing-costs"
			title="Closing Cost Estimator"
			description="Project seller net proceeds after taxes and fees."
		>
			<div className="grid gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="closing-sale-price"
						className="font-medium text-muted-foreground text-sm"
					>
						Sale Price*
					</label>
					<input
						id="closing-sale-price"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="400000"
						value={inputs.salePrice}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, salePrice: event.target.value }))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="closing-tax"
						className="font-medium text-muted-foreground text-sm"
					>
						Property Taxes*
					</label>
					<input
						id="closing-tax"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="4500"
						value={inputs.propertyTaxes}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								propertyTaxes: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="closing-title"
						className="font-medium text-muted-foreground text-sm"
					>
						Title Fees*
					</label>
					<input
						id="closing-title"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="1200"
						value={inputs.titleFees}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, titleFees: event.target.value }))
						}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label
						htmlFor="closing-transfer"
						className="font-medium text-muted-foreground text-sm"
					>
						Transfer Tax Rate (%)
					</label>
					<input
						id="closing-transfer"
						type="number"
						min={0}
						step="0.1"
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="1.5"
						value={inputs.transferTaxRate}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								transferTaxRate: event.target.value,
							}))
						}
					/>
				</div>

				<div className="flex flex-col gap-2 md:col-span-2">
					<label
						htmlFor="closing-misc"
						className="font-medium text-muted-foreground text-sm"
					>
						Miscellaneous Fees
					</label>
					<input
						id="closing-misc"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="800"
						value={inputs.miscFees}
						onChange={(event) =>
							setInputs((prev) => ({ ...prev, miscFees: event.target.value }))
						}
					/>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Transfer Tax
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.transferTax)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Total Closing Costs
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.totalClosingCosts)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Net Proceeds
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.results.netProceeds)}
					</p>
				</div>
			</div>
		</CalculatorCard>
	);
}
