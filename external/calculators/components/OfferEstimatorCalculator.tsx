"use client";

import React, { useEffect, useMemo, useState } from "react";

import { estimateOfferPrice, formatCurrency } from "../formulas";
import { CalculatorCard } from "./CalculatorCard";

const parseNumber = (value: string) => Number.parseFloat(value) || 0;

export function OfferEstimatorCalculator() {
	const [inputs, setInputs] = useState({
		arv: "",
		repairCost: "",
		desiredProfit: "",
		aiConfidence: "0.8",
		comp1: "",
		comp2: "",
		comp3: "",
	});

	const comps = useMemo(
		() =>
			[inputs.comp1, inputs.comp2, inputs.comp3]
				.map((value) => parseNumber(value))
				.filter((value) => value > 0)
				.map((price) => ({ price })),
		[inputs.comp1, inputs.comp2, inputs.comp3],
	);

	const [result, setResult] = useState({
		averageCompPrice: 0,
		baseMAO: 0,
		adjustedOffer: 0,
		aiConfidence: 0.8,
	});

	useEffect(() => {
		let cancelled = false;
		void estimateOfferPrice({
			comps,
			repairCost: parseNumber(inputs.repairCost),
			desiredProfit: parseNumber(inputs.desiredProfit),
			arv: parseNumber(inputs.arv),
			aiConfidence: Number.parseFloat(inputs.aiConfidence) || 0.8,
		}).then((response) => {
			if (!cancelled) {
				setResult(response.results);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [
		comps,
		inputs.aiConfidence,
		inputs.arv,
		inputs.desiredProfit,
		inputs.repairCost,
	]);

	return (
		<CalculatorCard
			id="offer-estimator"
			title="Offer Price Estimator"
			description="Blend MAO analysis with AI confidence adjustments."
		>
			<div className="grid gap-4 md:grid-cols-4">
				<div className="flex flex-col gap-2">
					<label
						htmlFor="offer-arv"
						className="font-medium text-muted-foreground text-sm"
					>
						ARV*
					</label>
					<input
						id="offer-arv"
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
						htmlFor="offer-repair"
						className="font-medium text-muted-foreground text-sm"
					>
						Repair Cost*
					</label>
					<input
						id="offer-repair"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="40000"
						value={inputs.repairCost}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								repairCost: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="offer-profit"
						className="font-medium text-muted-foreground text-sm"
					>
						Desired Profit*
					</label>
					<input
						id="offer-profit"
						type="number"
						min={0}
						className="rounded border border-input bg-background p-2 text-sm"
						placeholder="30000"
						value={inputs.desiredProfit}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								desiredProfit: event.target.value,
							}))
						}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label
						htmlFor="offer-confidence"
						className="font-medium text-muted-foreground text-sm"
					>
						AI Confidence (0.5 – 1.0)
					</label>
					<input
						id="offer-confidence"
						type="number"
						min={0.5}
						max={1}
						step="0.01"
						className="rounded border border-input bg-background p-2 text-sm"
						value={inputs.aiConfidence}
						onChange={(event) =>
							setInputs((prev) => ({
								...prev,
								aiConfidence: event.target.value,
							}))
						}
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{["comp1", "comp2", "comp3"].map((field, index) => (
					<div className="flex flex-col gap-2" key={field}>
						<label
							htmlFor={`offer-${field}`}
							className="font-medium text-muted-foreground text-sm"
						>
							Comparable #{index + 1} Price
						</label>
						<input
							id={`offer-${field}`}
							type="number"
							min={0}
							className="rounded border border-input bg-background p-2 text-sm"
							value={inputs[field as keyof typeof inputs]}
							onChange={(event) =>
								setInputs((prev) => ({
									...prev,
									[field]: event.target.value,
								}))
							}
						/>
					</div>
				))}
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Average Comp Price
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.averageCompPrice)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Base MAO
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.baseMAO)}
					</p>
				</div>
				<div className="rounded border border-border bg-background p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-wide">
						Adjusted Offer
					</p>
					<p className="font-semibold text-lg text-foreground">
						{formatCurrency(result.adjustedOffer)}
					</p>
					<p className="mt-1 text-muted-foreground text-xs">
						AI Confidence: {(result.aiConfidence * 100).toFixed(0)}%
					</p>
				</div>
			</div>
		</CalculatorCard>
	);
}
