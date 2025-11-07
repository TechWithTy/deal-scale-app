"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import React, { useEffect, useRef, useState, type ReactElement } from "react";

import { ScrollProgress } from "@/components/ui/scroll-progress";

const ACTIVE_MIN_PROGRESS = 0.15;
const MAX_PROGRESS_BEFORE_COMPLETE = 0.9;
const TICK_INTERVAL_MS = 200;
const COMPLETE_DELAY_MS = 250;

/**
 * Displays a top-of-page progress bar that mirrors global loading activity.
 * React Query fetch/mutation counts drive the progress animation so users get
 * immediate feedback when data is inflight.
 */
export default function GlobalLoadProgress(): ReactElement {
	const fetchCount = useIsFetching();
	const mutationCount = useIsMutating();
	const isLoading = fetchCount > 0 || mutationCount > 0;
	const [progress, setProgress] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	useEffect(() => {
		if (isLoading) {
			setIsVisible(true);
			setProgress((prev) =>
				prev < ACTIVE_MIN_PROGRESS ? ACTIVE_MIN_PROGRESS : prev,
			);
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			intervalRef.current = setInterval(() => {
				setProgress((prev) => {
					if (prev >= MAX_PROGRESS_BEFORE_COMPLETE) {
						return prev;
					}
					const remaining = MAX_PROGRESS_BEFORE_COMPLETE - prev;
					const easingStep = Math.max(0.05, remaining * 0.3);
					return Math.min(prev + easingStep, MAX_PROGRESS_BEFORE_COMPLETE);
				});
			}, TICK_INTERVAL_MS);
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
			}
			return () => {
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			};
		}

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		setProgress(1);
		completionTimeoutRef.current = setTimeout(() => {
			setIsVisible(false);
			setProgress(0);
		}, COMPLETE_DELAY_MS);

		return () => {
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
				completionTimeoutRef.current = null;
			}
		};
	}, [isLoading]);

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			if (completionTimeoutRef.current) {
				clearTimeout(completionTimeoutRef.current);
			}
		};
	}, []);

	return (
		<ScrollProgress
			data-testid="global-load-progress"
			data-loading={isVisible ? "true" : "false"}
			aria-hidden={!isVisible}
			className="pointer-events-none"
			progress={progress}
			style={{
				opacity: isVisible ? 1 : 0,
				transition: "opacity 150ms ease",
			}}
		/>
	);
}
