"use client";

import React from "react";

import { EmbedFocusWidget } from "@/components/external/embed-focus-widget";
import type { FocusEmbedConfig } from "external/embed/focus/config";

const demoConfig: FocusEmbedConfig = {
	mode: "voice",
	theme: "dark",
	playlist: "spotify:playlist:37i9dQZF1DX8Uebhn9wzrS",
	openOnLoad: true,
	voiceWebhook: "/api/mock-voice-agents",
	advancedConfig: {
		title: "DealScale Focus",
		subtitle: "Stay in flow with curated music & AI agents.",
		showCloseButton: true,
	},
};

export default function FocusWidgetDemoPage(): JSX.Element {
	return (
		<main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
			<div className="max-w-lg w-full">
				<EmbedFocusWidget config={demoConfig} />
			</div>
		</main>
	);
}
