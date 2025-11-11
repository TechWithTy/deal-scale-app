"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/_utils";
import {
	computeDealScaleProfileRoi,
	type DealScaleProfileInputs,
} from "@/external/calculators/utils/dealScaleRoi";
import { getQuickStartROIPreset } from "@/lib/config/quickstart/roiDefaults";
import { useQuickStartROIProfile } from "@/hooks/useQuickStartROIProfile";

const formatNumber = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 1,
	minimumFractionDigits: 0,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

interface HighlightMetric {
	label: string;
	value: string;
	annotation?: string;
	color: "sky" | "emerald" | "amber" | "violet";
}

const StatCard = ({ metric }: { readonly metric: HighlightMetric }) => (
	<div
		className={cn(
			"flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-md",
			metric.color === "sky" && "from-sky-500/20 to-sky-400/10",
		)}
	>
		<p className="text-xs font-medium uppercase tracking-[0.28em] text-neutral-400">
			{metric.label}
		</p>
		<p className="text-3xl font-bold text-white">{metric.value}</p>
		{metric.annotation ? (
			<p className="text-xs text-neutral-400">{metric.annotation}</p>
		) : null}
	</div>
);

export const PrefilledROICalculator = () => {
	const [accordionValue, setAccordionValue] = useState<string>("roi-accordion");

	const { profile, metadata } = useQuickStartROIProfile();
	const preset = useMemo(
		() =>
			getQuickStartROIPreset(
				metadata.personaId ?? undefined,
				metadata.goalId ?? undefined,
			),
		[metadata.goalId, metadata.personaId],
	);

	const profileInputs: DealScaleProfileInputs = {
		...preset.profileInputs,
		...profile,
	};

	const roiMetrics = useMemo(
		() => computeDealScaleProfileRoi(profileInputs),
		[profileInputs],
	);

	const hoursSavedPerWeek =
		Math.max(
			1,
			Math.round(
				roiMetrics.totalTimeSaved /
					Math.max(1, (profileInputs.months ?? 12) * 4),
			),
		) || preset.highlights.hoursSavedPerWeek;

	const responseRateIncrease = preset.highlights.responseRateIncrease;
	const conversionMultiplier = preset.highlights.conversionMultiplier;
	const annualROIValue = roiMetrics.netProfit;

	const highlightMetrics: HighlightMetric[] = [
		{
			label: "Hours Saved / Week",
			value: `${formatNumber.format(hoursSavedPerWeek)}h`,
			color: "sky",
			annotation: metadata.companySizeLabel ?? undefined,
		},
		{
			label: "Response Rate",
			value: `${formatNumber.format(responseRateIncrease)}% ↑`,
			color: "emerald",
			annotation: metadata.crmName ?? "AI-assisted follow-up",
		},
		{
			label: "Conversion Speed",
			value: `${formatNumber.format(conversionMultiplier)}×`,
			color: "amber",
			annotation: "Compared to manual outreach",
		},
		{
			label: "Annual ROI",
			value: currencyFormatter.format(Math.max(0, annualROIValue ?? 0)),
			color: "violet",
			annotation: metadata.avgLeadsPerMonth
				? `${metadata.avgLeadsPerMonth}+ leads / month`
				: "Projected net profit",
		},
	];

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setAccordionValue("roi-accordion");
		}, 1500);

		return () => {
			window.clearTimeout(timer);
		};
	}, []);

	return (
		<Accordion
			type="single"
			collapsible
			value={accordionValue}
			onValueChange={setAccordionValue}
			className="mt-6 w-full"
		>
			<AccordionItem value="roi-accordion" className="border-none">
				<AccordionTrigger className="rounded-2xl bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-indigo-500/10 px-4 text-lg font-semibold text-sky-400">
					📊 See Your Predicted Impact
				</AccordionTrigger>
				<AccordionContent>
					<div className="relative mt-4 overflow-hidden rounded-2xl">
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/40 via-cyan-400/30 to-indigo-500/40 opacity-60 blur-xl" />
						<div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 shadow-[0_0_40px_rgba(14,116,144,0.35)]">
							<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-300">
								<span>
									{metadata.personaTitle ?? "Your team"} •{" "}
									{metadata.goalTitle ?? "QuickStart Plan"}
								</span>
								{metadata.tier ? (
									<span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/80">
										{metadata.tier}
									</span>
								) : null}
							</div>
							<motion.div
								initial={{ opacity: 0, y: 24 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, ease: "easeOut" }}
								className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
							>
								{highlightMetrics.map((metric) => (
									<motion.div
										key={metric.label}
										initial={{ opacity: 0, y: 16 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, ease: "easeOut" }}
									>
										<StatCard metric={metric} />
									</motion.div>
								))}
							</motion.div>
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};

export default PrefilledROICalculator;
