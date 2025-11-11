"use client";

import {
	type MotionProps,
	motion,
	useMotionValue,
	useScroll,
	useSpring,
} from "motion/react";
import type React from "react";
import { forwardRef, useEffect } from "react";

import { cn } from "@/lib/utils";

interface ScrollProgressProps
	extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
	progress?: number;
	style?: React.CSSProperties;
}

export const ScrollProgress = forwardRef<HTMLDivElement, ScrollProgressProps>(
	({ className, progress, style, ...props }, ref) => {
		const { scrollYProgress } = useScroll();
		const manualProgress = useMotionValue(progress ?? 0);

		useEffect(() => {
			if (typeof progress === "number") {
				manualProgress.set(progress);
			}
		}, [progress, manualProgress]);

		const animatedProgress = useSpring(
			typeof progress === "number" ? manualProgress : scrollYProgress,
			{ stiffness: 120, damping: 20, mass: 0.3 },
		);

		return (
			<motion.div
				ref={ref}
				className={cn(
					"fixed inset-x-0 top-0 z-50 h-px origin-left bg-gradient-to-r from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]",
					className,
				)}
				style={{
					scaleX: animatedProgress,
					...style,
				}}
				{...props}
			/>
		);
	},
);

ScrollProgress.displayName = "ScrollProgress";
