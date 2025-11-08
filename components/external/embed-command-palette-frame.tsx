"use client";

import React, { useEffect } from "react";

import { useCommandPalette } from "external/action-bar/components/providers/CommandPaletteProvider";
import { StandaloneCommandPaletteProvider } from "external/action-bar/components/providers/StandaloneCommandPaletteProvider";
import ActionBarRoot from "external/action-bar/components/ActionBarRoot";
import type { CommandPaletteEmbedConfig } from "external/embed/command-palette/config";

type EmbedCommandPaletteFrameProps = {
	config: CommandPaletteEmbedConfig;
};

function LauncherButton({
	label,
	keyboardHint,
}: {
	label: string;
	keyboardHint?: string;
}) {
	const { setOpen } = useCommandPalette();

	return (
		<button
			type="button"
			className="deal-scale-command-launcher"
			onClick={() => setOpen(true)}
		>
			<span>{label}</span>
			{keyboardHint ? (
				<kbd className="deal-scale-command-kbd">{keyboardHint}</kbd>
			) : null}
		</button>
	);
}

export function EmbedCommandPaletteFrame({
	config,
}: EmbedCommandPaletteFrameProps) {
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!config.token) return;
		window.DealActionBar = {
			...(window.DealActionBar ?? {}),
			token: config.token,
		};
	}, [config.token]);

	const title = config.advancedConfig.title ?? "Command Palette";
	const description =
		config.advancedConfig.description ??
		"Search commands, navigate anywhere, and trigger Deal Scale actions.";
	const buttonLabel =
		config.advancedConfig.buttonLabel ?? "Open command palette";
	const keyboardHint = config.advancedConfig.keyboardHint ?? "⌘K / Ctrl+K";

	return (
		<div
			className="deal-scale-command-embed"
			data-theme="light"
			aria-live="polite"
		>
			<StandaloneCommandPaletteProvider
				aiSuggestEndpoint={config.aiSuggestEndpoint}
				keyboard={config.keyboard}
				variant={config.variant}
				initialQuery={config.initialQuery}
				openOnSelect={config.openOnSelect}
				selectContainer={config.selectContainer}
			>
				<section className="deal-scale-command-card">
					<header className="deal-scale-command-header">
						<strong>{title}</strong>
						<p>{description}</p>
					</header>
					<LauncherButton label={buttonLabel} keyboardHint={keyboardHint} />
				</section>
				<ActionBarRoot />
			</StandaloneCommandPaletteProvider>
		</div>
	);
}
