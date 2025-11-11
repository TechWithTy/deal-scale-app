"use client";

import React, { Fragment } from "react";

import { groupCalculatorsByCategory } from "../registry";
import type { CalculatorDefinition } from "../types";

interface CalculatorHubProps {
	calculators: CalculatorDefinition[];
}

export function CalculatorHub({ calculators }: CalculatorHubProps) {
	const grouped = groupCalculatorsByCategory(calculators);

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
			<nav aria-label="Calculator navigation" className="space-y-6">
				{grouped.map(({ category, items }) => (
					<section key={category} className="space-y-2">
						<h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
							{category}
						</h2>
						<ul className="space-y-1">
							{items.map((item) => (
								<li key={item.id}>
									<a
										className="block rounded-md px-2 py-1 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
						<div className="grid gap-6 lg:grid-cols-2">
							{items.map(({ Component, id }) => (
								<Component key={id} />
							))}
						</div>
					</Fragment>
				))}
			</div>
		</div>
	);
}
