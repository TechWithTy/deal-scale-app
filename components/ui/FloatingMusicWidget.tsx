"use client";

import type { LottieRefCurrentProps } from "lottie-react";
import { GripVertical } from "lucide-react";
// biome-ignore lint/style/useImportType: runtime import required for test environment
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { Rnd } from "react-rnd";

import { VoiceModePanel } from "@/components/ui/floating-music-widget/VoiceModePanel";
import {
	MAX_WIDGET_HEIGHTS,
	MIN_WIDGET_HEIGHTS,
	SNAP_MARGIN,
	SNAP_THRESHOLD,
	WIDGET_MAX_WIDTH,
	WIDGET_MIN_WIDTH,
	WIDGET_WIDTH,
	computeDefaultPosition,
} from "@/components/ui/floating-music-widget/constants";
import {
	clampToViewport,
	useFloatingMusicDebug,
	useFloatingMusicPortal,
} from "@/components/ui/floating-music-widget/hooks";
import {
	type MusicWidgetMode,
	type MusicWidgetPosition,
	useMusicPreferencesStore,
} from "@/lib/stores/musicPreferences";
import { cn } from "@/lib/utils";
import { calculateSnapAnchor, snapToEdge } from "@/lib/utils/snapToEdge";

interface DragDataLike {
	x: number;
	y: number;
}

export default function FloatingMusicWidget(): React.ReactNode {
	const { effectiveProvider, effectivePlaylistUri, shouldRender, preferences } =
		useFloatingMusicDebug();
	const widgetPosition = useMusicPreferencesStore(
		(state) => state.widgetPosition,
	);
	const setWidgetPosition = useMusicPreferencesStore(
		(state) => state.setWidgetPosition,
	);
	const widgetHeights = useMusicPreferencesStore(
		(state) => state.widgetHeights,
	);
	const widgetWidth = useMusicPreferencesStore((state) => state.widgetWidth);
	const setWidgetHeight = useMusicPreferencesStore(
		(state) => state.setWidgetHeight,
	);
	const setWidgetWidth = useMusicPreferencesStore(
		(state) => state.setWidgetWidth,
	);
	const setEnabled = useMusicPreferencesStore((state) => state.setEnabled);
	const setProvider = useMusicPreferencesStore((state) => state.setProvider);
	const mode = useMusicPreferencesStore((state) => state.mode);
	const setMode = useMusicPreferencesStore((state) => state.setMode);

	const [mounted, setMounted] = useState(false);
	const [position, setPosition] = useState<MusicWidgetPosition | null>(null);
	const voiceLottieRef = useRef<LottieRefCurrentProps | null>(null);
	const [isVoiceAnimating, setIsVoiceAnimating] = useState(true);
	const [iframeStatus, setIframeStatus] = useState<
		"pending" | "loaded" | "error"
	>("pending");
	const currentHeight = widgetHeights[mode];
	const currentWidth = widgetWidth;
	const minHeight = MIN_WIDGET_HEIGHTS[mode];
	const maxHeight = MAX_WIDGET_HEIGHTS[mode];
	const portalNode = useFloatingMusicPortal();
	const iframeAttributes = useMemo(() => {
		const baseAttributes: React.IframeHTMLAttributes<HTMLIFrameElement> = {
			allow:
				"autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
			loading: "lazy",
			title: "Focus music player",
		};
		if (effectiveProvider === "internal") {
			return {
				...baseAttributes,
				srcDoc: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><style>body{margin:0;font-family:system-ui;background:#0f172a;color:#e2e8f0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;}button{background:#38bdf8;border:none;border-radius:9999px;color:#0f172a;font-weight:600;padding:0.75rem 1.5rem;cursor:pointer;}p{max-width:200px;text-align:center;line-height:1.4;}</style></head><body><p>Focus playlist coming soon. Launch Spotify to start your flow.</p><button onclick="window.open('https://open.spotify.com/genre/study-page', '_blank')">Open Spotify</button></body></html>`,
				sandbox: "allow-scripts allow-same-origin",
			};
		}
		const playlistId = effectivePlaylistUri.replace("spotify:playlist:", "");
		return {
			...baseAttributes,
			src: `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=dealscale`,
		};
	}, [effectivePlaylistUri, effectiveProvider]);
	const playlistId = useMemo(
		() => effectivePlaylistUri.replace("spotify:playlist:", ""),
		[effectivePlaylistUri],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: also reset when playlist changes
	useEffect(() => {
		if (effectiveProvider !== "spotify") {
			setIframeStatus("loaded");
			return;
		}
		setIframeStatus("pending");
	}, [effectiveProvider, playlistId]);

	useEffect(() => {
		if (effectiveProvider !== "spotify") return undefined;
		if (iframeStatus !== "pending") return undefined;
		const timer = window.setTimeout(() => {
			console.warn(
				"[FocusWidget] Spotify embed timed out (likely blocked by CSP)",
			);
			setIframeStatus("error");
		}, 3000);
		return () => window.clearTimeout(timer);
	}, [effectiveProvider, iframeStatus]);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		if (!shouldRender) return;
		if (widgetPosition) {
			const safePosition = clampToViewport(
				widgetPosition,
				currentWidth,
				currentHeight,
			);
			setPosition(safePosition);
			if (
				widgetPosition.x !== safePosition.x ||
				widgetPosition.y !== safePosition.y ||
				widgetPosition.anchor !== safePosition.anchor
			) {
				void setWidgetPosition(safePosition, { sync: false });
			}
			return;
		}

		const defaultPosition = computeDefaultPosition();
		setPosition(defaultPosition);
		void setWidgetPosition(defaultPosition, { sync: false });
	}, [
		currentHeight,
		currentWidth,
		shouldRender,
		setWidgetPosition,
		widgetPosition,
	]);

	useEffect(() => {
		console.debug("[FocusWidget] render state", {
			shouldRender,
			enabled: preferences.enabled,
			provider: preferences.provider,
			mode,
		});
		if (position) {
			console.debug("[FocusWidget] current position", position);
		}
	}, [mode, position, preferences.enabled, preferences.provider, shouldRender]);

	useEffect(() => {
		if (typeof window === "undefined") return undefined;
		const handleShow = () => {
			console.debug("[FocusWidget] Received show event");
			setEnabled(true);
			setMode("music");
			if (!preferences.provider) {
				setProvider("internal");
			}
		};
		window.addEventListener("dealScale:musicWidget:show", handleShow);
		return () =>
			window.removeEventListener("dealScale:musicWidget:show", handleShow);
	}, [preferences.provider, setEnabled, setMode, setProvider]);

	useEffect(() => {
		if (!mounted) return undefined;
		function handleResize(): void {
			setPosition((prev) => {
				if (!prev) return prev;
				const next = clampToViewport(prev, currentWidth, currentHeight);
				if (
					prev.x === next.x &&
					prev.y === next.y &&
					prev.anchor === next.anchor
				)
					return prev;
				void setWidgetPosition(next, { sync: true });
				return next;
			});
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [mounted, currentWidth, currentHeight, setWidgetPosition]);

	const handleDragStop = (_event: unknown, data: DragDataLike): void => {
		if (typeof window === "undefined") return;
		const snapped = snapToEdge(
			{ x: data.x, y: data.y },
			{ width: currentWidth, height: currentHeight },
			{ viewportWidth: window.innerWidth, viewportHeight: window.innerHeight },
			{ threshold: SNAP_THRESHOLD, margin: SNAP_MARGIN },
		);
		const anchor = calculateSnapAnchor(
			snapped,
			window.innerWidth,
			window.innerHeight,
			currentWidth,
			currentHeight,
		);
		const nextPosition: MusicWidgetPosition = { ...snapped, anchor };
		setPosition(nextPosition);
		void setWidgetPosition(nextPosition, { sync: true });
	};

	const sanitizeHeight = (value: number): number => {
		if (Number.isNaN(value)) return currentHeight;
		return Math.min(Math.max(value, minHeight), maxHeight);
	};
	const sanitizeWidth = (value: number): number => {
		if (Number.isNaN(value)) return currentWidth;
		return Math.min(Math.max(value, WIDGET_MIN_WIDTH), WIDGET_MAX_WIDTH);
	};

	const handleAgentSelect = useCallback((agentId: string) => {
		console.debug("[FocusWidget] Voice agent selected", agentId);
	}, []);

	const handleResize = (
		_event: unknown,
		_direction: unknown,
		ref: HTMLElement,
		_delta: { height: number; width: number },
		newPosition: DragDataLike,
	) => {
		const raw = ref.offsetHeight;
		const nextHeight = sanitizeHeight(raw);
		const rawWidth = ref.offsetWidth;
		const nextWidth = sanitizeWidth(rawWidth);
		setWidgetHeight(mode, nextHeight);
		setWidgetWidth(nextWidth);
		setPosition((prev) => {
			const base = prev ?? { ...newPosition, anchor: "top-left" as const };
			const clamped = clampToViewport(
				{ ...newPosition, anchor: base.anchor },
				nextWidth,
				nextHeight,
			);
			return clamped;
		});
	};

	const handleResizeStop = (
		_event: unknown,
		_direction: unknown,
		ref: HTMLElement,
		_delta: { height: number; width: number },
		newPosition: DragDataLike,
	) => {
		const raw = ref.offsetHeight;
		const nextHeight = sanitizeHeight(raw);
		const rawWidth = ref.offsetWidth;
		const nextWidth = sanitizeWidth(rawWidth);
		setWidgetHeight(mode, nextHeight);
		setWidgetWidth(nextWidth);
		setPosition((prev) => {
			const base = prev ?? { ...newPosition, anchor: "top-left" as const };
			const clamped = clampToViewport(
				{ ...newPosition, anchor: base.anchor },
				nextWidth,
				nextHeight,
			);
			void setWidgetPosition(clamped, { sync: true });
			return clamped;
		});
	};

	if (!mounted || !shouldRender) {
		return null;
	}

	if (!portalNode || !position) {
		console.debug("[FocusWidget] Skipping render", {
			portalNodeExists: Boolean(portalNode),
			position,
			shouldRender,
			mounted,
		});
		return null;
	}

	const handleModeChange = (nextMode: MusicWidgetMode) => {
		if (mode === nextMode) return;
		setMode(nextMode);
		setIsVoiceAnimating(true);
		voiceLottieRef.current?.play?.();
		if (!position) return;
		const height = widgetHeights[nextMode];
		const nextPosition = clampToViewport(position, currentWidth, height);
		setPosition(nextPosition);
		void setWidgetPosition(nextPosition, { sync: true });
	};

	const toggleVoiceAnimation = () => {
		const ref = voiceLottieRef.current;
		if (!ref) return;
		if (isVoiceAnimating) {
			ref.pause?.();
		} else {
			ref.play?.();
		}
		setIsVoiceAnimating((prev) => !prev);
	};

	const content = (
		<div className="pointer-events-none fixed inset-0 z-[1200]">
			<Rnd
				data-testid="floating-music-widget"
				bounds="parent"
				size={{ width: currentWidth, height: currentHeight }}
				position={{ x: position.x, y: position.y }}
				enableResizing={{
					top: false,
					topLeft: false,
					topRight: false,
					left: true,
					right: true,
					bottomLeft: true,
					bottomRight: true,
					bottom: true,
				}}
				minWidth={WIDGET_MIN_WIDTH}
				maxWidth={WIDGET_MAX_WIDTH}
				minHeight={minHeight}
				maxHeight={maxHeight}
				onDragStop={handleDragStop}
				onResize={handleResize}
				onResizeStop={handleResizeStop}
				dragHandleClassName="floating-music-widget__drag-area"
				className="pointer-events-auto"
			>
				<div className="pointer-events-auto flex h-full w-full flex-col overflow-hidden rounded-xl border border-primary/40 bg-background shadow-lg backdrop-blur">
					<div className="floating-music-widget__drag-area flex items-center justify-between bg-primary/10 px-3 py-2 text-xs uppercase tracking-wide">
						<div className="flex items-center gap-3">
							<span className="font-semibold text-primary">Focus</span>
							<div className="flex rounded-full bg-primary/10 p-0.5">
								{(
									[
										{ id: "music", label: "Music" },
										{ id: "voice", label: "Voice" },
									] as const
								).map((tab) => (
									<button
										key={tab.id}
										type="button"
										onClick={() => handleModeChange(tab.id)}
										className={cn(
											"rounded-full px-2.5 py-1 font-semibold text-[11px] transition",
											mode === tab.id
												? "bg-primary text-background shadow-sm"
												: "text-primary/70 hover:bg-primary/20",
										)}
										aria-pressed={mode === tab.id}
									>
										{tab.label}
									</button>
								))}
							</div>
						</div>
						<GripVertical className="h-4 w-4 text-primary/60" aria-hidden />
					</div>
					<div className="flex-1">
						{mode === "music" ? (
							iframeStatus === "error" ? (
								<SpotifyBlockedNotice playlistId={playlistId} />
							) : (
								<iframe
									key={`${effectiveProvider}-${effectivePlaylistUri}`}
									className="h-full w-full border-0"
									onLoad={() => setIframeStatus("loaded")}
									{...iframeAttributes}
								/>
							)
						) : (
							<VoiceModePanel
								isAnimating={isVoiceAnimating}
								onToggleAnimation={toggleVoiceAnimation}
								onAgentSelect={handleAgentSelect}
								voiceLottieRef={voiceLottieRef}
							/>
						)}
					</div>
				</div>
			</Rnd>
		</div>
	);

	return createPortal(content, portalNode);
}

interface SpotifyBlockedNoticeProps {
	playlistId: string;
}

function SpotifyBlockedNotice({
	playlistId,
}: SpotifyBlockedNoticeProps): React.ReactElement {
	const playlistUrl = `https://open.spotify.com/playlist/${playlistId}`;
	return (
		<div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-background to-secondary/20 px-4 text-center text-primary/80 text-sm">
			<p className="font-semibold text-primary">
				Spotify embed blocked by Content Security Policy
			</p>
			<p className="text-muted-foreground text-xs">
				Update your `frame-src` directive to allow `https://open.spotify.com` or
				open the playlist in Spotify directly.
			</p>
			<div className="flex flex-col gap-2">
				<a
					href={`${playlistUrl}?utm_source=dealscale`}
					target="_blank"
					rel="noreferrer"
					className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow hover:bg-primary/90"
				>
					Open playlist in Spotify
				</a>
				<code className="rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground">
					frame-src 'self' https://open.spotify.com;
				</code>
			</div>
		</div>
	);
}
