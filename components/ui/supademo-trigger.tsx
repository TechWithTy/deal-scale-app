"use client";

import { useEffect, useRef } from "react";

interface SupademoTriggerProps {
	demoId?: string;
	showcaseId?: string;
	apiKey?: string;
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
}

/**
 * SupademoTrigger Component
 *
 * Provides a declarative way to trigger Supademo demos and showcases
 * Supports both data attribute method and programmatic API method
 */
export function SupademoTrigger({
	demoId,
	showcaseId,
	apiKey = process.env.NEXT_PUBLIC_SUPADEMO_API_KEY,
	children,
	className = "",
	onClick,
}: SupademoTriggerProps) {
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		// Load Supademo SDK if not already loaded
		if (typeof window !== "undefined" && !window.Supademo) {
			const script = document.createElement("script");
			script.src = "/api/supademo/script";
			script.async = true;
			document.head.appendChild(script);
		}
	}, []);

	const handleClick = () => {
		if (onClick) {
			onClick();
		}
		// No additional work needed—Supademo listens for click events
	};

	// Use data attribute method as fallback
	const dataProps = demoId
		? { "data-supademo-demo": demoId }
		: showcaseId
			? { "data-supademo-showcase": showcaseId }
			: {};

	return (
		<button
			ref={triggerRef}
			className={className}
			onClick={handleClick}
			{...dataProps}
		>
			{children}
		</button>
	);
}

/**
 * Hook for programmatic Supademo integration
 */
export function useSupademo() {
	useEffect(() => {
		if (typeof window !== "undefined" && !window.Supademo) {
			const script = document.createElement("script");
			script.src = "/api/supademo/script";
			script.async = true;
			document.head.appendChild(script);
		}
	}, []);

	const dispatchSupademoEvent = (
		attribute: "data-supademo-demo" | "data-supademo-showcase",
		value: string,
	) => {
		if (typeof document === "undefined") return;
		const placeholder = document.createElement("button");
		placeholder.type = "button";
		placeholder.style.position = "fixed";
		placeholder.style.left = "-9999px";
		placeholder.style.top = "-9999px";
		placeholder.style.pointerEvents = "none";
		placeholder.setAttribute(attribute, value);
		document.body.appendChild(placeholder);
		placeholder.click();
		window.requestAnimationFrame(() => {
			document.body.removeChild(placeholder);
		});
	};

	const ensureInitialised = (overrideKey?: string) => {
		const key = overrideKey || process.env.NEXT_PUBLIC_SUPADEMO_API_KEY;
		if (typeof window === "undefined" || !key) return;
		if (typeof window.Supademo === "function") {
			window.Supademo(key, { variables: {} });
		}
	};

	const triggerWithRetry = (
		attribute: "data-supademo-demo" | "data-supademo-showcase",
		value: string,
		apiKey?: string,
		attempt = 0,
	) => {
		if (!value) return;
		if (typeof window === "undefined") return;
		if (typeof window.Supademo !== "function") {
			if (attempt >= 5) return;
			window.setTimeout(() => {
				triggerWithRetry(attribute, value, apiKey, attempt + 1);
			}, 300);
			return;
		}

		ensureInitialised(apiKey);
		dispatchSupademoEvent(attribute, value);
	};

	const loadDemo = (demoId: string, apiKey?: string) => {
		triggerWithRetry("data-supademo-demo", demoId, apiKey);
	};

	const loadShowcase = (showcaseId: string, apiKey?: string) => {
		triggerWithRetry("data-supademo-showcase", showcaseId, apiKey);
	};

	return { loadDemo, loadShowcase };
}
