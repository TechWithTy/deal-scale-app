"use client";
import { cn } from "@/lib/utils/index";
import { AnimatePresence, motion } from "motion/react";
import React, { useState, useEffect } from "react";

export const LayoutTextFlip = ({
	text = "Build Amazing",
	words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
	duration = 3000,
}: {
	text: string;
	words: string[];
	duration?: number;
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		setCurrentIndex(0);

		if (words.length <= 1) {
			return;
		}

		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
		}, duration);

		return () => clearInterval(interval);
	}, [words, duration]);

	return (
		<>
			<motion.span
				layoutId="subtext"
				className="font-bold text-2xl tracking-tight drop-shadow-lg md:text-4xl"
			>
				{text}
			</motion.span>

			<motion.span
				layout
				className="relative w-fit overflow-hidden rounded-md border border-transparent bg-white px-4 py-2 font-bold font-sans text-2xl text-black tracking-tight shadow-black/10 shadow-sm ring ring-black/10 drop-shadow-lg md:text-4xl dark:bg-neutral-900 dark:text-white dark:shadow-sm dark:shadow-white/10 dark:ring-1 dark:ring-white/10"
			>
				<AnimatePresence mode="popLayout">
					<motion.span
						key={currentIndex}
						initial={{ y: -40, filter: "blur(10px)" }}
						animate={{
							y: 0,
							filter: "blur(0px)",
						}}
						exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
						transition={{
							duration: 0.5,
						}}
						className={cn("inline-block whitespace-nowrap")}
					>
						{words[currentIndex] ?? words[0] ?? ""}
					</motion.span>
				</AnimatePresence>
			</motion.span>
		</>
	);
};
