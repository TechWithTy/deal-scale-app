"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { Fragment, useEffect, useMemo } from "react";

import { groupCalculatorsByCategory } from "../registry";
import type { CalculatorComponentProps, CalculatorDefinition } from "../types";
import { getActiveCalculatorId, parseCalculatorSearchParams } from "../utils";

interface CalculatorHubProps {
	calculators: CalculatorDefinition[];
}

const workflowShortcuts = [
	{
		title: "Cash Buyer",
		description:
			"Start with a buy-box score, then move into pricing and spread checks.",
		actions: [
			{
				label: "Cash Buyer Buy Box Scorer",
				href: "#calculator-cash-buyer-buy-box",
			},
			{ label: "Offer Price Estimator", href: "#calculator-offer-estimator" },
			{ label: "Wholesale Calculator", href: "#calculator-wholesale" },
			{ label: "Fix & Flip ROI", href: "#calculator-fix-flip-roi" },
		],
	},
	{
		title: "Off-Market Seller",
		description:
			"Focus on seller net proceeds and acquisition ceilings before comparing outcomes.",
		actions: [
			{
				label: "Off-Market MAO Calculator",
				href: "#calculator-off-market-mao",
			},
			{ label: "Offer Price Estimator", href: "#calculator-offer-estimator" },
			{ label: "Closing Cost Estimator", href: "#calculator-closing-costs" },
			{ label: "Deal Comparison", href: "#calculator-deal-comparison" },
		],
	},
] as const;

export function CalculatorHub({ calculators }: CalculatorHubProps) {
	const grouped = groupCalculatorsByCategory(calculators);
	const searchParams = useSearchParams();
	const serializedParams = searchParams ? searchParams.toString() : "";

	const prefillMap = useMemo(
		() =>
			parseCalculatorSearchParams(
				serializedParams,
				calculators.map((calculator) => calculator.id),
			),
		[serializedParams, calculators],
	);

	const requestedCalculatorId = useMemo(
		() =>
			getActiveCalculatorId(
				serializedParams,
				calculators.map((calculator) => calculator.id),
			),
		[serializedParams, calculators],
	);

	const firstPrefilledId = useMemo(() => {
		const keys = Object.keys(prefillMap);
		return keys.length > 0 ? keys[0] : undefined;
	}, [prefillMap]);

	const categoryCounts = useMemo(
		() =>
			grouped.reduce<Record<string, number>>((accumulator, group) => {
				accumulator[group.category] = group.items.length;
				return accumulator;
			}, {}),
		[grouped],
	);

	useEffect(() => {
		const targetId = requestedCalculatorId ?? firstPrefilledId;
		if (!targetId) return;
		const element =
			typeof document !== "undefined"
				? document.getElementById(`calculator-${targetId}`)
				: null;
		if (element && typeof element.scrollIntoView === "function") {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [requestedCalculatorId, firstPrefilledId]);

	return (
		<div className="space-y-8">
			<section
				className="grid gap-3 md:grid-cols-2"
				data-tour="calculations-shortcuts"
			>
				{workflowShortcuts.map((shortcut) => (
					<Card key={shortcut.title} className="border-border/70 bg-card/60">
						<CardHeader className="space-y-2 pb-4">
							<div className="flex items-center justify-between gap-3">
								<CardTitle className="text-base">{shortcut.title}</CardTitle>
								<span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
									Workflow
								</span>
							</div>
							<CardDescription>{shortcut.description}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							{shortcut.actions.map((action) => (
								<Button
									key={action.href}
									asChild
									variant="outline"
									className="w-full justify-between"
								>
									<a href={action.href}>
										<span>{action.label}</span>
										<ArrowRight className="h-4 w-4" />
									</a>
								</Button>
							))}
						</CardContent>
					</Card>
				))}
			</section>

			<nav
				aria-label="Calculator navigation"
				className="grid w-full gap-3 rounded-xl border border-border bg-card/40 p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-5"
				data-tour="calculations-nav"
			>
				{grouped.map(({ category, items }) => (
					<section
						key={category}
						className="flex h-full min-w-0 flex-col rounded-lg border border-border/60 bg-background/70 p-3"
					>
						<div className="mb-3 flex items-center justify-between gap-2">
							<h2 className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
								{category}
							</h2>
							<span className="rounded-full border border-border bg-card px-2 py-0.5 font-medium text-[11px] text-muted-foreground">
								{categoryCounts[category] ?? items.length}
							</span>
						</div>
						<ul className="space-y-1">
							{items.map((item) => (
								<li key={item.id}>
									<a
										className="block rounded-md border border-transparent px-3 py-2 text-foreground text-sm transition-colors hover:border-border hover:bg-accent hover:text-accent-foreground"
										href={`#calculator-${item.id}`}
									>
										{item.title}
									</a>
								</li>
							))}
						</ul>
					</section>
				))}
			</nav>

			<div className="space-y-8" data-tour="calculations-grid">
				{grouped.map(({ category, items }) => (
					<Fragment key={category}>
						<div className="flex items-center justify-between gap-3">
							<h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
								{category}
							</h2>
							<span className="text-muted-foreground text-xs">
								{items.length} calculator{items.length === 1 ? "" : "s"}
							</span>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							{items.map(({ Component, id }, index) => (
								<div
									key={id}
									className={`min-w-0 ${index < 2 ? "md:col-span-2" : ""}`}
								>
									<Component
										initialValues={
											prefillMap[
												id
											] as CalculatorComponentProps["initialValues"]
										}
									/>
								</div>
							))}
						</div>
					</Fragment>
				))}
			</div>
		</div>
	);
}
