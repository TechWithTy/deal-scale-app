"use client";

import { defineDealActionBar } from "./define";

export { defineDealActionBar };

// Inject minimal CSS tokens to ensure sane defaults for script-tag consumers.
function ensureCssTokens() {
	if (typeof document === "undefined") return;
	if (document.getElementById("deal-action-bar-tokens")) return;
	const css = `:root{--background:#fff;--foreground:#111827;--popover:#ffffff;--popover-foreground:#111827;--ring:60 4.8% 95.9%;--muted-foreground:#6b7280;--destructive:#ef4444}.dark{--background:#0b0b0c;--foreground:#f3f4f6;--popover:#111213;--popover-foreground:#f3f4f6}`;
	const style = document.createElement("style");
	style.id = "deal-action-bar-tokens";
	style.textContent = css;
	document.head.appendChild(style);
}

// Attach helpers to window for script-tag consumers
if (typeof window !== "undefined") {
	const g: NonNullable<Window["DealActionBar"]> | any =
		(window as any).DealActionBar || ((window as any).DealActionBar = {});
	if (typeof g.define !== "function") {
		g.define = (tag?: string) => defineDealActionBar(tag);
	}
	if (typeof g.init !== "function") {
		g.init = (
			attrs?: Record<string, string | number | boolean>,
			mountTo?: HTMLElement,
		) => {
			const tag = "deal-action-bar";
			defineDealActionBar(tag);
			let el = document.querySelector(tag) as HTMLElement | null;
			if (!el) {
				el = document.createElement(tag);
				if (attrs) {
					for (const [k, v] of Object.entries(attrs)) {
						if (v === undefined || v === null) continue;
						el.setAttribute(k, String(v));
					}
				}
				(mountTo || document.documentElement).appendChild(el);
			}
			g.element = el;
			return el;
		};
	}
	// Provide default CSS variables for immediate rendering.
	try {
		ensureCssTokens();
	} catch {}
}
