"use client";

import React from "react";
import { createRoot, type Root } from "react-dom/client";
import ActionBarRoot from "../components/ActionBarRoot";
import { StandaloneCommandPaletteProvider } from "../components/providers/StandaloneCommandPaletteProvider";

function parseBoolAttr(
	val: string | null | undefined,
	defaultValue = true,
): boolean {
	if (val == null) return defaultValue;
	const v = String(val).toLowerCase();
	if (v === "false" || v === "0" || v === "no") return false;
	if (v === "true" || v === "1" || v === "yes") return true;
	return defaultValue;
}

export function defineDealActionBar(tag = "deal-action-bar") {
	if (customElements.get(tag)) return;

	class DealActionBarElement extends HTMLElement {
		private root: Root | null = null;

		connectedCallback() {
			// Attributes
			const aiSuggestEndpoint =
				this.getAttribute("ai-suggest-endpoint") ?? "/api/ai/command-suggest";
			const variantAttr =
				(this.getAttribute("variant") as "dialog" | "floating") ?? "dialog";
			const keyboard = parseBoolAttr(this.getAttribute("keyboard"), true);
			const initialQuery = this.getAttribute("initial-query") ?? "";
			const pomFlowUrl = this.getAttribute("pom-flow-url") ?? undefined;
			const token = this.getAttribute("token") ?? undefined;
			const openOnSelect = parseBoolAttr(
				this.getAttribute("open-on-select"),
				false,
			);
			const selectContainer =
				this.getAttribute("select-container") ?? undefined;

			// Mount
			if (!this.root) {
				const mount = document.createElement("div");
				mount.style.all = "initial"; // isolate as much as possible without Shadow DOM (Tailwind compatibility)
				this.appendChild(mount);
				this.root = createRoot(mount);
			}
			// If a token is provided via attribute, expose it to the global API for fetch forwarding
			if (typeof window !== "undefined" && token) {
				(window as any).DealActionBar = {
					...((window as any).DealActionBar || {}),
					token,
				};
			}
			this.root!.render(
				<StandaloneCommandPaletteProvider
					aiSuggestEndpoint={aiSuggestEndpoint}
					variant={variantAttr}
					keyboard={keyboard}
					initialQuery={initialQuery}
					pomFlowUrl={pomFlowUrl}
					openOnSelect={openOnSelect}
					selectContainer={selectContainer}
				>
					<ActionBarRoot />
				</StandaloneCommandPaletteProvider>,
			);
		}

		disconnectedCallback() {
			if (this.root) {
				this.root.unmount();
				this.root = null;
			}
			this.replaceChildren();
		}
	}

	customElements.define(tag, DealActionBarElement);
}

// Auto-define if running in a browser context and not already defined
if (typeof window !== "undefined" && typeof customElements !== "undefined") {
	try {
		defineDealActionBar();
	} catch {}
}
