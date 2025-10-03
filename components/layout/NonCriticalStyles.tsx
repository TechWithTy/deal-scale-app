"use client";

import { useEffect } from "react";

const NON_CRITICAL_STYLESHEET_ID = "deal-scale-non-critical-css";
const NON_CRITICAL_STYLESHEET_PATH = "/css/non-critical.css";

/**
 * Injects the deferred stylesheet into the document head while ensuring duplicate
 * tags are not created across re-renders.
 */
function appendNonCriticalStyles() {
	const { head } = document;
	if (!head) {
		return;
	}

	const existingStylesheet = head.querySelector<HTMLLinkElement>(
		`link#${NON_CRITICAL_STYLESHEET_ID}[data-non-critical="true"]`,
	);
	if (existingStylesheet) {
		if (existingStylesheet.media !== "all") {
			existingStylesheet.media = "all";
		}
		return;
	}

	const preload = document.createElement("link");
	preload.rel = "preload";
	preload.as = "style";
	preload.href = NON_CRITICAL_STYLESHEET_PATH;

	const stylesheet = document.createElement("link");
	stylesheet.id = NON_CRITICAL_STYLESHEET_ID;
	stylesheet.rel = "stylesheet";
	stylesheet.href = NON_CRITICAL_STYLESHEET_PATH;
	stylesheet.media = "print";
	stylesheet.dataset.nonCritical = "true";
	stylesheet.onload = () => {
		stylesheet.media = "all";
	};

	head.append(preload, stylesheet);
}

/**
 * Client-only component that defers loading of non-critical global styles until
 * after hydration, preventing render-blocking CSS from affecting FCP.
 */
export function NonCriticalStyles() {
	useEffect(() => {
		appendNonCriticalStyles();
	}, []);

	return null;
}

export default NonCriticalStyles;
