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
	const typingText =
		typeof children === "string"
			? children
			: children == null
				? ""
				: String(children);

	useEffect(() => {
		const startTimeout = setTimeout(() => {
			setStarted(true);
		}, delay);
		return () => clearTimeout(startTimeout);
	}, [delay]);

	useEffect(() => {
		if (!started) return;

		setDisplayedText("");
		let i = 0;
		const typingEffect = setInterval(() => {
			if (i < typingText.length) {
				setDisplayedText(typingText.substring(0, i + 1));
				i++;
			} else {
				clearInterval(typingEffect);
				onComplete?.();
			}
		}, duration);

		return () => {
			clearInterval(typingEffect);
		};
	}, [duration, onComplete, started, typingText]);

	return (
		<span ref={elementRef} className={cn("", className)}>
			{displayedText}
		</span>
	);
}
