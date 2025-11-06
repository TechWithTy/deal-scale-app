"use client";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeToggle() {
	const { setTheme } = useTheme();

	const pickRandom = (options: string[]) =>
		options[Math.floor(Math.random() * options.length)];

	const moodVariants = [
		"variant-mood-calm",
		"variant-mood-focused",
		"variant-mood-energetic",
	];
	const weatherVariants = [
		"variant-weather-sunny",
		"variant-weather-rainy",
		"variant-weather-stormy",
	];
	const pipelineVariants = [
		"variant-pipeline-healthy",
		"variant-pipeline-watch",
		"variant-pipeline-risk",
	];

	const normalizeRootClasses = () => {
		const root = document.documentElement;
		root.classList.forEach((c) => {
			if (c.includes(" ")) root.classList.remove(c); // guard against whitespace tokens
			if (c.startsWith("theme-")) root.classList.remove(c); // remove legacy theme-* tokens
		});
	};

	const setVariant = (variant: string) => {
		const root = document.documentElement;
		// remove any previous variant-* and legacy theme-*
		root.classList.forEach((c) => {
			if (c.startsWith("variant-")) root.classList.remove(c);
			if (c.startsWith("theme-")) root.classList.remove(c);
		});
		root.classList.add(variant);
		try {
			localStorage.setItem("ds-variant", variant);
		} catch {}
	};

	// Re-apply selected variant whenever theme changes (light/dark/system) or on mount
	useEffect(() => {
		try {
			normalizeRootClasses();
			const v = localStorage.getItem("ds-variant");
			if (v && !v.includes(" ")) {
				document.documentElement.classList.add(v);
			}
		} catch {}
	}, []);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon">
					<SunIcon className="dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0" />
					<MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					Light
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					Dark
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					System
				</DropdownMenuItem>
				{/* Single standout actions under System */}
				<DropdownMenuItem
					onClick={() => setVariant(pickRandom(moodVariants))}
					className="mt-1 font-semibold"
				>
					<span className="mr-2 h-2 w-2 rounded-full bg-sky-500" />
					Mood
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setVariant(pickRandom(weatherVariants))}
					className="font-semibold"
				>
					<span className="mr-2 h-2 w-2 rounded-full bg-amber-400" />
					Weather
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setVariant(pickRandom(pipelineVariants))}
					className="font-semibold"
				>
					<span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
					Pipeline
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
