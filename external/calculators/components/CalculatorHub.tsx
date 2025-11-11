"use client";

import React, { Fragment, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { groupCalculatorsByCategory } from "../registry";
import type { CalculatorComponentProps, CalculatorDefinition } from "../types";
import { parseCalculatorSearchParams } from "../utils";

interface CalculatorHubProps {
	calculators: CalculatorDefinition[];
}

export function CalculatorHub({ calculators }: CalculatorHubProps) {
	const grouped = groupCalculatorsByCategory(calculators);
	const searchParams = useSearchParams();
	const serializedParams = searchParams.toString();

	const prefillMap = useMemo(
		() =>
			parseCalculatorSearchParams(
				serializedParams,
				calculators.map((calculator) => calculator.id),
			),
		[serializedParams, calculators],
	);

	return (
		<div className="space-y-8">
			<nav
				aria-label="Calculator navigation"
				className="flex w-full gap-6 overflow-x-auto rounded-xl border border-border bg-card/40 p-4 shadow-sm"
			>
				{grouped.map(({ category, items }) => (
					<section
						key={category}
						className="min-w-[200px] space-y-2"
					>
						<h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
							{category}
						</h2>
						<ul className="space-y-1">
							{items.map((item) => (
								<li key={item.id}>
									<a
										className="block rounded-md px-3 py-1 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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

			<div className="space-y-8">
				{grouped.map(({ category, items }) => (
					<Fragment key={category}>
						<h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
							{category}
						</h2>
						<div className="grid gap-6 md:grid-cols-2">
							{items.map(({ Component, id }, index) => (
								<div
									key={id}
									className={`min-w-0 ${index < 2 ? "md:col-span-2" : ""}`}
								>
									<Component
										initialValues={
											prefillMap[id] as CalculatorComponentProps["initialValues"]
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
