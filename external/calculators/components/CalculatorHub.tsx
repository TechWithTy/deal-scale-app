"use client";

import React, { Fragment, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { groupCalculatorsByCategory } from "../registry";
import type { CalculatorComponentProps, CalculatorDefinition } from "../types";
import { getActiveCalculatorId, parseCalculatorSearchParams } from "../utils";

interface CalculatorHubProps {
	calculators: CalculatorDefinition[];
}

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
			<nav
				aria-label="Calculator navigation"
				className="flex w-full flex-col gap-4 overflow-x-auto rounded-xl border border-border bg-card/40 p-4 shadow-sm md:flex-row md:flex-wrap md:overflow-x-visible"
			>
				{grouped.map(({ category, items }) => (
					<section
						key={category}
						className="min-w-0 space-y-2 md:min-w-[160px]"
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
