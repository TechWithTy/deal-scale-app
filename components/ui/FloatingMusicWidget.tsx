"use client";

import type { LottieRefCurrentProps } from "lottie-react";
import {
	GripVertical,
	Maximize2,
	Minimize2,
	Mic,
	Music2,
	Phone,
	Video as VideoIcon,
	X,
} from "lucide-react";
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

import {
	PhoneModePanel,
	VideoModePanel,
	VoiceModePanel,
	type VoiceMediaEvent,
} from "@/components/ui/floating-music-widget/VoiceModePanel";
import {
	MAX_WIDGET_HEIGHTS,
	MIN_WIDGET_HEIGHTS,
	WIDGET_MINIMIZED_HEIGHT,
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
	const widgetView = useMusicPreferencesStore((state) => state.widgetView);
	const setWidgetView = useMusicPreferencesStore(
		(state) => state.setWidgetView,
	);

	const [mounted, setMounted] = useState(false);
	const tabsDebugEnabled =
		process.env.NEXT_PUBLIC_MUSIC_WIDGET_TABS_DEBUG === "true" ||
		process.env.NEXT_PUBLIC_MUSIC_WIDGET_DEBUG === "true";
	const logTabEvent = useCallback(
		(stage: string, payload: Record<string, unknown> = {}): void => {
			if (!tabsDebugEnabled) return;
			console.debug("[FocusWidget][Tabs]", stage, {
				mode,
				...payload,
			});
		},
		[mode, tabsDebugEnabled],
	);
	const [position, setPosition] = useState<MusicWidgetPosition | null>(null);
	const voiceLottieRef = useRef<LottieRefCurrentProps | null>(null);
	const [isVoiceAnimating, setIsVoiceAnimating] = useState(true);
	const [iframeStatus, setIframeStatus] = useState<
		"pending" | "loaded" | "error"
	>("pending");
	const tabsContainerRef = useRef<HTMLDivElement | null>(null);
	const tabDragStateRef = useRef<{
		pointerId: number | null;
		startX: number;
		startScrollLeft: number;
		moved: boolean;
	}>({
		pointerId: null,
		startX: 0,
		startScrollLeft: 0,
		moved: false,
	});
	const tabScrollResetTimeoutRef = useRef<number | null>(null);
	const currentHeight = widgetHeights[mode];
	const currentWidth = widgetWidth;
	const minHeight = MIN_WIDGET_HEIGHTS[mode];
	const maxHeight = MAX_WIDGET_HEIGHTS[mode];
	const portalNode = useFloatingMusicPortal();
	const view = widgetView[mode];
	const isMinimized = view === "minimized";
	const isMaximized = view === "maximized";
	const displayHeight = isMinimized ? WIDGET_MINIMIZED_HEIGHT : currentHeight;
	const minAllowedHeight = isMinimized ? WIDGET_MINIMIZED_HEIGHT : minHeight;
	const maxAllowedHeight = isMinimized ? WIDGET_MINIMIZED_HEIGHT : maxHeight;
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
	const previousSizesRef = useRef<
		Partial<Record<MusicWidgetMode, { width: number; height: number }>>
	>({});
	const applyClampedPosition = useCallback(
		(width: number, height: number) => {
			setPosition((prev) => {
				if (!prev) return prev;
				const clamped = clampToViewport(prev, width, height);
				void setWidgetPosition(clamped, { sync: true });
				return clamped;
			});
		},
		[setWidgetPosition],
	);
	const rememberSize = useCallback(() => {
		if (!previousSizesRef.current[mode]) {
			previousSizesRef.current[mode] = {
				width: currentWidth,
				height: currentHeight,
			};
		}
	}, [currentHeight, currentWidth, mode]);
	const restoreSize = useCallback(() => {
		const previous = previousSizesRef.current[mode];
		if (previous) {
			setWidgetWidth(previous.width);
			setWidgetHeight(mode, previous.height);
			applyClampedPosition(previous.width, previous.height);
			delete previousSizesRef.current[mode];
		}
	}, [applyClampedPosition, mode, setWidgetHeight, setWidgetWidth]);

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
			setMode("voice");
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

	useEffect(() => {
		return () => {
			if (tabScrollResetTimeoutRef.current !== null) {
				window.clearTimeout(tabScrollResetTimeoutRef.current);
			}
		};
	}, []);

	const resetScrollFlagSoon = () => {
		if (tabScrollResetTimeoutRef.current !== null) {
			window.clearTimeout(tabScrollResetTimeoutRef.current);
		}
		tabScrollResetTimeoutRef.current = window.setTimeout(() => {
			tabDragStateRef.current.moved = false;
			tabScrollResetTimeoutRef.current = null;
			logTabEvent("resetScrollFlag");
		}, 160);
	};

	const handleTabsPointerDown = (
		event: React.PointerEvent<HTMLDivElement>,
	): void => {
		if (event.button !== 0) return;
		const container = tabsContainerRef.current;
		if (!container) return;
		if (tabScrollResetTimeoutRef.current !== null) {
			window.clearTimeout(tabScrollResetTimeoutRef.current);
			tabScrollResetTimeoutRef.current = null;
		}
		tabDragStateRef.current.pointerId = event.pointerId;
		tabDragStateRef.current.startX = event.clientX;
		tabDragStateRef.current.startScrollLeft = container.scrollLeft;
		tabDragStateRef.current.moved = false;
		logTabEvent("pointerDown", {
			pointerId: event.pointerId,
			startX: event.clientX,
			scrollLeft: container.scrollLeft,
		});
	};

	const handleTabsPointerMove = (
		event: React.PointerEvent<HTMLDivElement>,
	): void => {
		const state = tabDragStateRef.current;
		const container = tabsContainerRef.current;
		if (!container || state.pointerId !== event.pointerId) return;
		const deltaX = Math.abs(event.clientX - state.startX);
		const deltaScroll = Math.abs(container.scrollLeft - state.startScrollLeft);
		if (deltaX > 4 || deltaScroll > 4) {
			if (!state.moved) {
				logTabEvent("pointerMoveThreshold", {
					pointerId: event.pointerId,
					deltaX,
					deltaScroll,
				});
			}
			state.moved = true;
		}
	};

	const handleTabsPointerUp = (
		event: React.PointerEvent<HTMLDivElement>,
	): void => {
		const state = tabDragStateRef.current;
		const container = tabsContainerRef.current;
		if (!container || state.pointerId !== event.pointerId) return;
		const deltaScroll = Math.abs(container.scrollLeft - state.startScrollLeft);
		if (deltaScroll > 4) {
			if (!state.moved) {
				logTabEvent("pointerUpThreshold", {
					pointerId: event.pointerId,
					deltaScroll,
				});
			}
			state.moved = true;
		}
		logTabEvent("pointerUp", {
			pointerId: event.pointerId,
			deltaScroll,
			moved: state.moved,
		});
		state.pointerId = null;
		resetScrollFlagSoon();
	};

	const handleTabsPointerCancel = (): void => {
		const state = tabDragStateRef.current;
		logTabEvent("pointerCancel", {
			pointerId: state.pointerId,
		});
		state.pointerId = null;
		resetScrollFlagSoon();
	};

	const handleTabsScroll = (): void => {
		logTabEvent("scroll", {
			scrollLeft: tabsContainerRef.current?.scrollLeft ?? "n/a",
		});
		tabDragStateRef.current.moved = true;
		resetScrollFlagSoon();
	};

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

	const handleClipboardPaste = useCallback((content: string) => {
		console.debug("[FocusWidget] clipboard content received", {
			preview: content.slice(0, 120),
			length: content.length,
		});
	}, []);

	const handleMediaEvent = useCallback((event: VoiceMediaEvent) => {
		console.debug("[FocusWidget] media permission event", event);
	}, []);

	const handleBrowserAccess = useCallback(() => {
		console.debug("[FocusWidget] browser assistance requested");
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
		if (isMaximized) {
			delete previousSizesRef.current[mode];
			setWidgetView(mode, "default");
		}
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
		if (nextMode === "voice") {
			setIsVoiceAnimating(true);
			voiceLottieRef.current?.play?.();
		} else {
			setIsVoiceAnimating(false);
			voiceLottieRef.current?.pause?.();
		}
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

	const handleMinimize = () => {
		if (isMinimized) {
			const latestState = useMusicPreferencesStore.getState();
			const width = latestState.widgetWidth;
			const height = latestState.widgetHeights[mode];
			setWidgetView(mode, "default");
			applyClampedPosition(width, height);
			return;
		}
		if (isMaximized) {
			restoreSize();
		}
		const latestState = useMusicPreferencesStore.getState();
		setWidgetView(mode, "minimized");
		applyClampedPosition(latestState.widgetWidth, WIDGET_MINIMIZED_HEIGHT);
	};

	const handleMaximize = () => {
		if (isMaximized) {
			restoreSize();
			setWidgetView(mode, "default");
			return;
		}
		rememberSize();
		const targetHeight = MAX_WIDGET_HEIGHTS[mode];
		setWidgetView(mode, "maximized");
		setWidgetWidth(WIDGET_MAX_WIDTH);
		setWidgetHeight(mode, targetHeight);
		applyClampedPosition(WIDGET_MAX_WIDTH, targetHeight);
	};

	const controlButtonClasses = (
		active: boolean,
		variant: "neutral" | "destructive" = "neutral",
	) =>
		cn(
			"group relative flex h-7 w-7 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2",
			variant === "destructive"
				? "border-destructive/60 bg-destructive/15 text-destructive hover:border-destructive/70 hover:bg-destructive/25 hover:text-destructive-foreground active:bg-destructive/35 active:text-destructive-foreground focus-visible:ring-destructive/40"
				: "focus-visible:ring-primary/30 hover:text-primary active:text-primary",
			variant === "neutral" &&
				(active
					? "border-primary bg-primary text-primary-foreground shadow-sm"
					: "border-primary/20 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10 active:bg-primary/20"),
		);

	const handleClose = () => {
		setWidgetView("voice", "default");
		setWidgetView("video", "default");
		setWidgetView("phone", "default");
		setWidgetView("music", "default");
		setEnabled(false);
	};

	const handleControlPointerDown = (
		event: React.PointerEvent<HTMLButtonElement>,
	) => {
		event.stopPropagation();
	};

	const handleControlMouseDown = (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.stopPropagation();
	};

	const content = (
		<div className="pointer-events-none fixed inset-0 z-[1200]">
			<Rnd
				data-testid="floating-music-widget"
				bounds="parent"
				cancel=".floating-music-widget__tabs, .floating-music-widget__tabs button"
				size={{ width: currentWidth, height: displayHeight }}
				position={{ x: position.x, y: position.y }}
				enableResizing={
					isMinimized
						? false
						: {
								top: false,
								topLeft: false,
								topRight: false,
								left: true,
								right: true,
								bottomLeft: true,
								bottomRight: true,
								bottom: true,
							}
				}
				minWidth={WIDGET_MIN_WIDTH}
				maxWidth={WIDGET_MAX_WIDTH}
				minHeight={minAllowedHeight}
				maxHeight={maxAllowedHeight}
				onDragStop={handleDragStop}
				onResize={handleResize}
				onResizeStop={handleResizeStop}
				dragHandleClassName="floating-music-widget__drag-area"
				className="pointer-events-auto"
			>
				<div className="pointer-events-auto relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-primary/40 bg-background shadow-lg backdrop-blur">
					<button
						type="button"
						onClick={handleClose}
						className="floating-music-widget__close absolute right-1 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 sm:right-2 sm:top-2"
						aria-label="Close focus widget"
						onPointerDown={handleControlPointerDown}
						onMouseDown={handleControlMouseDown}
					>
						<X className="h-3.5 w-3.5" aria-hidden />
					</button>
					<div className="floating-music-widget__drag-area flex items-center justify-between bg-primary/10 px-3 pr-16 py-2 text-xs uppercase tracking-wide">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<span className="font-semibold text-primary">Focus</span>
								<GripVertical className="h-4 w-4 text-primary/60" aria-hidden />
							</div>
							<div className="flex flex-1 min-w-0 justify-center sm:justify-start">
								<div
									ref={tabsContainerRef}
									className="floating-music-widget__tabs relative inline-flex w-full max-w-[208px] flex-none items-center overflow-x-auto whitespace-nowrap rounded-full bg-primary/10 p-0.5 self-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] [touch-action:pan-x] [overscroll-behavior-inline:contain] sm:max-w-[240px] sm:self-start"
									onPointerDown={handleTabsPointerDown}
									onPointerMove={handleTabsPointerMove}
									onPointerUp={handleTabsPointerUp}
									onPointerCancel={handleTabsPointerCancel}
									onScroll={handleTabsScroll}
								>
									<div className="inline-flex w-max gap-1 pr-1">
										{(
											[
												{
													id: "voice",
													label: "Voice",
													Icon: Mic,
												},
												{
													id: "video",
													label: "Video",
													Icon: VideoIcon,
												},
												{
													id: "phone",
													label: "Phone",
													Icon: Phone,
												},
												{
													id: "music",
													label: "Music",
													Icon: Music2,
												},
											] as const
										).map((tab) => (
											<button
												key={tab.id}
												type="button"
												title={tab.label}
												onClick={(event) => {
													if (tabDragStateRef.current.moved) {
														logTabEvent("tabClickSuppressed", {
															tab: tab.id,
														});
														event.preventDefault();
														event.stopPropagation();
														tabDragStateRef.current.moved = false;
														return;
													}
													handleModeChange(tab.id);
													tabDragStateRef.current.moved = false;
													logTabEvent("tabSelected", { tab: tab.id });
												}}
												className={cn(
													"grid min-w-[44px] place-items-center rounded-full px-2.5 py-1 text-center text-[11px] transition",
													mode === tab.id
														? "bg-primary text-background shadow-sm"
														: "text-primary/70 hover:bg-primary/20",
												)}
												aria-pressed={mode === tab.id}
												aria-label={tab.label}
											>
												<tab.Icon className="h-4 w-4 shrink-0" aria-hidden />
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-2 pr-10">
							<button
								type="button"
								onClick={handleMinimize}
								className={controlButtonClasses(isMinimized)}
								aria-label={
									isMinimized ? "Restore focus widget" : "Minimize focus widget"
								}
								aria-pressed={isMinimized}
								onPointerDown={handleControlPointerDown}
								onMouseDown={handleControlMouseDown}
							>
								<Minimize2 className="h-3.5 w-3.5" aria-hidden />
							</button>
							<button
								type="button"
								onClick={handleMaximize}
								className={controlButtonClasses(isMaximized)}
								aria-label={
									isMaximized
										? "Restore focus widget size"
										: "Maximize focus widget"
								}
								aria-pressed={isMaximized}
								onPointerDown={handleControlPointerDown}
								onMouseDown={handleControlMouseDown}
							>
								<Maximize2 className="h-3.5 w-3.5" aria-hidden />
							</button>
						</div>
					</div>
					{isMinimized ? null : (
						<div className="flex-1 min-h-0 overflow-hidden">
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
							) : mode === "voice" ? (
								<VoiceModePanel
									isAnimating={isVoiceAnimating}
									onToggleAnimation={toggleVoiceAnimation}
									onAgentSelect={handleAgentSelect}
									onClipboardPaste={handleClipboardPaste}
									voiceLottieRef={voiceLottieRef}
									onMediaEvent={handleMediaEvent}
									onRequestBrowserAccess={handleBrowserAccess}
								/>
							) : mode === "video" ? (
								<VideoModePanel
									onAgentSelect={handleAgentSelect}
									onClipboardPaste={handleClipboardPaste}
									onMediaEvent={handleMediaEvent}
									onRequestBrowserAccess={handleBrowserAccess}
								/>
							) : (
								<PhoneModePanel
									onAgentSelect={handleAgentSelect}
									onClipboardPaste={handleClipboardPaste}
									onMediaEvent={handleMediaEvent}
									onRequestBrowserAccess={handleBrowserAccess}
								/>
							)}
						</div>
					)}
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
