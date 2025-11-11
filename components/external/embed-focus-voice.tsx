"use client";

import React from "react";

import type { MediaStatus } from "@/lib/hooks/useEmbedMediaPermissions";

export type VoiceAgent = {
	id: string;
	name: string;
	status?: string;
};

type VoicePanelProps = {
	screenState: MediaStatus;
	cameraState: MediaStatus;
	voiceStatus: "idle" | "loading" | "success" | "error";
	voiceAgents: VoiceAgent[];
	voiceError?: string | null;
	onScreenShare: () => void;
	onCameraShare: () => void;
	onRetryAgents: () => void;
	showClose: boolean;
	onClose: () => void;
};

export function VoicePanel({
	screenState,
	cameraState,
	voiceStatus,
	voiceAgents,
	voiceError,
	onScreenShare,
	onCameraShare,
	onRetryAgents,
	showClose,
	onClose,
}: VoicePanelProps) {
	if (process.env.NODE_ENV !== "production") {
		// eslint-disable-next-line no-console
		console.info("[VoicePanel] render", {
			voiceStatus,
			agents: voiceAgents.length,
		});
	}
	return (
		<div className="deal-scale-focus-voice">
			<div
				className="deal-scale-focus-media"
				role="group"
				aria-label="Voice session controls"
			>
				<button
					type="button"
					className="deal-scale-focus-media-btn"
					onClick={onScreenShare}
					disabled={screenState.status === "pending"}
				>
					<span className="deal-scale-focus-media-icon" aria-hidden="true">
						<svg
							viewBox="0 0 24 24"
							width="16"
							height="16"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<rect x="3" y="4" width="18" height="12" rx="2" />
							<path d="M8 20h8" />
							<path d="M12 16v4" />
						</svg>
					</span>
					<span>Share screen</span>
				</button>
				<button
					type="button"
					className="deal-scale-focus-media-btn"
					onClick={onCameraShare}
					disabled={cameraState.status === "pending"}
				>
					<span className="deal-scale-focus-media-icon" aria-hidden="true">
						<svg
							viewBox="0 0 24 24"
							width="16"
							height="16"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M4 7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
							<path d="m14 10 5-3v10l-5-3" />
						</svg>
					</span>
					<span>Share camera</span>
				</button>
			</div>
			<div className="deal-scale-focus-voice-body">
				{screenState.message ? (
					<p className="deal-scale-focus-status">{screenState.message}</p>
				) : null}
				{cameraState.message ? (
					<p className="deal-scale-focus-status">{cameraState.message}</p>
				) : null}
				{voiceStatus === "loading" ? (
					<p className="deal-scale-focus-status">Loading agents…</p>
				) : null}
				{voiceStatus === "error" ? (
					<div className="deal-scale-focus-error" role="alert">
						<p>{voiceError ?? "Unable to load voice agents."}</p>
						<button type="button" onClick={onRetryAgents}>
							Try again
						</button>
					</div>
				) : null}
				{voiceStatus === "success" && voiceAgents.length === 0 ? (
					<p className="deal-scale-focus-status">
						No agents available right now.
					</p>
				) : null}
				{voiceAgents.length > 0 ? (
					<ul>
						{voiceAgents.map((agent) => (
							<li key={agent.id}>
								<span>{agent.name}</span>
								{agent.status ? (
									<span className="deal-scale-focus-chip">{agent.status}</span>
								) : null}
							</li>
						))}
					</ul>
				) : null}
			</div>
			{showClose ? (
				<button
					type="button"
					className="deal-scale-focus-close"
					onClick={onClose}
				>
					Close
				</button>
			) : null}
		</div>
	);
}
