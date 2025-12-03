"use client";

import { cn } from "@/lib/_utils";
import { useEffect, useRef, useState } from "react";

interface TypingAnimationProps {
	children: string;
	className?: string;
	duration?: number;
	delay?: number;
	onComplete?: () => void;
}

export function TypingAnimation({
	children,
	className,
	duration = 100,
	delay = 0,
	onComplete,
}: TypingAnimationProps) {
	const [displayedText, setDisplayedText] = useState<string>("");
	const [started, setStarted] = useState(false);
	const elementRef = useRef<HTMLSpanElement | null>(null);

	useEffect(() => {
		const startTimeout = setTimeout(() => {
			setStarted(true);
		}, delay);
		return () => clearTimeout(startTimeout);
	}, [delay]);

	useEffect(() => {
		if (!started) return;

		let i = 0;
		const typingEffect = setInterval(() => {
			if (i < children.length) {
				setDisplayedText(children.substring(0, i + 1));
				i++;
			} else {
				clearInterval(typingEffect);
				onComplete?.();
			}
		}, duration);

		return () => {
			clearInterval(typingEffect);
		};
	}, [children, duration, started, onComplete]);

	return (
		<span ref={elementRef} className={cn("", className)}>
			{displayedText}
		</span>
	);
}
