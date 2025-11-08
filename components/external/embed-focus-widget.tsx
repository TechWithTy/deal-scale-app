"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import type { FocusEmbedConfig } from "external/embed/focus/config";
import { useEmbedMediaPermissions } from "@/lib/hooks/useEmbedMediaPermissions";
import {
	VoicePanel,
	type VoiceAgent,
} from "@/components/external/embed-focus-voice";

type EmbedFocusWidgetProps = {
	config: FocusEmbedConfig;
	onError?: (error: Error) => void;
};

export function EmbedFocusWidget({ config, onError }: EmbedFocusWidgetProps) {
	const [isOpen, setIsOpen] = useState(config.openOnLoad);
	const [mode, setMode] = useState<"music" | "voice">(config.mode);
	const [voiceStatus, setVoiceStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>(config.voiceWebhook ? "loading" : "idle");
	const [voiceAgents, setVoiceAgents] = useState<VoiceAgent[]>([]);
	const [voiceError, setVoiceError] = useState<string | null>(null);
	const { screenState, cameraState, requestScreenShare, requestCameraShare } =
		useEmbedMediaPermissions(onError);

	const loadVoiceAgents = useCallback(async () => {
		if (!config.voiceWebhook) return;
		setVoiceStatus("loading");
		setVoiceError(null);
		try {
			const response = await fetch(config.voiceWebhook, {
				headers: {
					Accept: "application/json",
					...(config.voiceToken
						? { Authorization: `Bearer ${config.voiceToken}` }
						: {}),
				},
			});
			if (!response.ok) {
				throw new Error(
					`Voice agent request failed with status ${response.status}`,
				);
			}
			const payload = (await response.json()) as VoiceAgent[];
			setVoiceAgents(
				Array.isArray(payload)
					? payload.slice(0, config.advancedConfig.agentLimit ?? 6)
					: [],
			);
			setVoiceStatus("success");
		} catch (error) {
			const resolved =
				error instanceof Error
					? error
					: new Error("Failed to load voice agents");
			setVoiceStatus("error");
			setVoiceError(resolved.message);
			onError?.(resolved);
		}
	}, [
		config.voiceWebhook,
		config.voiceToken,
		config.advancedConfig.agentLimit,
		onError,
	]);

	useEffect(() => {
		if (!config.voiceWebhook) return;
		void loadVoiceAgents();
	}, [config.voiceWebhook, loadVoiceAgents]);

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			const isMac = navigator.platform.toUpperCase().includes("MAC");
			const mod = isMac ? event.metaKey : event.ctrlKey;
			if (mod && event.shiftKey && (event.key === "F" || event.key === "f")) {
				event.preventDefault();
				setIsOpen((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const playlistSrc = useMemo(() => {
		if (config.playlist.startsWith("spotify:playlist:")) {
			const playlistId = config.playlist.slice("spotify:playlist:".length);
			return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=dealscale`;
		}
		return config.playlist;
	}, [config.playlist]);

	const title = config.advancedConfig.title ?? "Focus";
	const subtitle =
		config.advancedConfig.subtitle ??
		"Stay in flow with curated music & AI agents.";
	const openLabel = config.advancedConfig.openLabel ?? "Open Focus Widget";
	const closeLabel = config.advancedConfig.closeLabel ?? "Close";
	const showClose = config.advancedConfig.showCloseButton ?? true;

	return (
		<div
			className="deal-scale-focus-embed"
			data-theme={config.theme}
			data-open={isOpen ? "true" : "false"}
		>
			<header className="deal-scale-focus-header">
				<div>
					<strong>{title}</strong>
					<p>{subtitle}</p>
				</div>
				<button
					type="button"
					className="deal-scale-focus-toggle"
					onClick={() => setIsOpen((prev) => !prev)}
				>
					{isOpen ? closeLabel : openLabel}
				</button>
			</header>
			{isOpen ? (
				<section className="deal-scale-focus-panel">
					<nav className="deal-scale-focus-tabs" aria-label="Focus modes">
						<button
							type="button"
							onClick={() => setMode("music")}
							className={mode === "music" ? "active" : ""}
							aria-pressed={mode === "music"}
						>
							Music
						</button>
						<button
							type="button"
							onClick={() => setMode("voice")}
							className={mode === "voice" ? "active" : ""}
							aria-pressed={mode === "voice"}
						>
							Voice
						</button>
					</nav>
					<div className="deal-scale-focus-content">
						{mode === "music" ? (
							<iframe
								key={playlistSrc}
								title="Focus playlist"
								src={playlistSrc}
								loading="lazy"
								allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
							/>
						) : (
							<VoicePanel
								screenState={screenState}
								cameraState={cameraState}
								voiceStatus={voiceStatus}
								voiceAgents={voiceAgents}
								voiceError={voiceError}
								onScreenShare={() => void requestScreenShare()}
								onCameraShare={() => void requestCameraShare()}
								onRetryAgents={() => {
									void loadVoiceAgents();
								}}
								showClose={showClose}
								onClose={() => setIsOpen(false)}
							/>
						)}
					</div>
					{mode === "music" && showClose ? (
						<button
							type="button"
							className="deal-scale-focus-close"
							onClick={() => setIsOpen(false)}
						>
							Close
						</button>
					) : null}
				</section>
			) : null}
		</div>
	);
}
