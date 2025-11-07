"use client";

import { useTheme } from "next-themes";
import { useMemo } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type SelectorOption = {
	label: string;
	value: string; // maps to next-themes class name
};

const moodOptions: SelectorOption[] = [
	{ label: "Calm", value: "theme-mood-calm" },
	{ label: "Focused", value: "theme-mood-focused" },
	{ label: "Energetic", value: "theme-mood-energetic" },
];

const weatherOptions: SelectorOption[] = [
	{ label: "Sunny", value: "theme-weather-sunny" },
	{ label: "Rainy", value: "theme-weather-rainy" },
	{ label: "Stormy", value: "theme-weather-stormy" },
];

const pipelineOptions: SelectorOption[] = [
	{ label: "Healthy", value: "theme-pipeline-healthy" },
	{ label: "Watch", value: "theme-pipeline-watch" },
	{ label: "At Risk", value: "theme-pipeline-risk" },
];

export default function StatusSelectors() {
	const { theme, setTheme } = useTheme();

	const derived = useMemo(() => {
		return {
			mood: moodOptions.find((o) => theme?.startsWith("theme-mood"))?.value,
			weather: weatherOptions.find((o) => theme?.startsWith("theme-weather"))
				?.value,
			pipeline: pipelineOptions.find((o) => theme?.startsWith("theme-pipeline"))
				?.value,
		};
	}, [theme]);

	const randomOf = (arr: SelectorOption[]) =>
		arr[Math.floor(Math.random() * arr.length)].value;

	return (
		<div className="hidden items-center gap-2 md:flex">
			{/* Mood */}
			<Select
				value={derived.mood}
				onValueChange={(v) => setTheme(v)}
				onOpenChange={(open) => {
					if (open) setTheme(randomOf(moodOptions));
				}}
			>
				<SelectTrigger className="h-8 w-[120px] border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
					<SelectValue placeholder="Mood" />
				</SelectTrigger>
				<SelectContent>
					{moodOptions.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Weather */}
			<Select
				value={derived.weather}
				onValueChange={(v) => setTheme(v)}
				onOpenChange={(open) => {
					if (open) setTheme(randomOf(weatherOptions));
				}}
			>
				<SelectTrigger className="h-8 w-[130px] border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
					<SelectValue placeholder="Weather" />
				</SelectTrigger>
				<SelectContent>
					{weatherOptions.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Pipeline Health */}
			<Select
				value={derived.pipeline}
				onValueChange={(v) => setTheme(v)}
				onOpenChange={(open) => {
					if (open) setTheme(randomOf(pipelineOptions));
				}}
			>
				<SelectTrigger className="h-8 w-[150px] border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/40 dark:text-green-200">
					<SelectValue placeholder="Pipeline" />
				</SelectTrigger>
				{/* keep content minimal; items optional */}
				<SelectContent>
					{pipelineOptions.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
