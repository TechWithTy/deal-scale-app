"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { motion } from "motion/react";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Check,
	Globe,
	Loader2,
	MonitorUp,
	Sparkles,
	Video,
} from "lucide-react";

import { TrackCommandPalette } from "@/components/ui/track-command-palette";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMusicPreferencesStore } from "@/lib/stores/musicPreferences";
import { cn } from "@/lib/utils";
import type { VoicePaletteOption } from "@/types/focus";
import VoiceLottie from "@/public/lottie/RecordingButton.json";
import { TypewriterEffect } from "../typewriter-effect";
import {
	VOICE_AGENT_OPTIONS,
	VOICE_PROMPTS,
	VOICE_SESSION_OPTIONS,
} from "./constants";

interface VoiceModePanelProps {
	isAnimating: boolean;
	onToggleAnimation: () => void;
	voiceLottieRef: React.MutableRefObject<LottieRefCurrentProps | null>;
	onAgentSelect?: (agentId: string) => void;
	onMediaEvent?: (event: VoiceMediaEvent) => void;
	onRequestBrowserAccess?: () => void;
}

type MediaStatus = "idle" | "pending" | "active" | "error";

export type VoiceMediaEvent =
	| { type: "screen-share" | "webcam"; status: "pending" }
	| { type: "screen-share" | "webcam"; status: "granted" }
	| {
			type: "screen-share" | "webcam";
			status: "denied";
			error?: string;
	  };

const statusCopy: Record<
	"screen-share" | "webcam",
	Record<MediaStatus, { message: string; description: string }>
> = {
	"screen-share": {
		idle: {
			message: "Share screen",
			description: "Grant access so the AI can follow along.",
		},
		pending: {
			message: "Waiting for screen permission…",
			description: "Confirm the browser prompt to continue.",
		},
		active: {
			message: "Screen sharing enabled",
			description: "You can now collaborate with the AI in real time.",
		},
		error: {
			message: "Screen share blocked",
			description: "Try again when you are ready.",
		},
	},
	webcam: {
		idle: {
			message: "Share webcam",
			description: "Let the AI pick up non-verbal signals.",
		},
		pending: {
			message: "Awaiting webcam permission…",
			description: "Approve the request in your browser.",
		},
		active: {
			message: "Webcam streaming",
			description: "The AI is now receiving visual context.",
		},
		error: {
			message: "Webcam access blocked",
			description: "You can retry any time.",
		},
	},
};

export function VoiceModePanel({
	isAnimating,
	onToggleAnimation,
	voiceLottieRef,
	onAgentSelect,
	onMediaEvent,
	onRequestBrowserAccess,
}: VoiceModePanelProps): React.ReactElement {
	const sessionHistory = useMusicPreferencesStore(
		(state) => state.sessionHistory,
	);
	const addSessionHistory = useMusicPreferencesStore(
		(state) => state.addSessionHistory,
	);
	const [screenStatus, setScreenStatus] = useState<MediaStatus>("idle");
	const [webcamStatus, setWebcamStatus] = useState<MediaStatus>("idle");
	const [screenError, setScreenError] = useState<string | null>(null);
	const [webcamError, setWebcamError] = useState<string | null>(null);
	const [browserAccessState, setBrowserAccessState] = useState<
		"idle" | "pending" | "granted"
	>("idle");
	const [browserHoldProgress, setBrowserHoldProgress] = useState(0);
	const [isHoldingBrowser, setIsHoldingBrowser] = useState(false);

	const screenMessage = useMemo(() => {
		const base = statusCopy["screen-share"][screenStatus];
		return {
			...base,
			description:
				screenStatus === "error" && screenError
					? screenError
					: base.description,
		};
	}, [screenStatus, screenError]);

	const webcamMessage = useMemo(() => {
		const base = statusCopy.webcam[webcamStatus];
		return {
			...base,
			description:
				webcamStatus === "error" && webcamError
					? webcamError
					: base.description,
		};
	}, [webcamStatus, webcamError]);

	const paletteOptions = useMemo<VoicePaletteOption[]>(() => {
		const history = sessionHistory
			.slice()
			.sort((a, b) => b.lastUsed - a.lastUsed)
			.map(({ lastUsed: _ignored, ...rest }) => ({
				...rest,
				badge: "Recent",
			}));
		const merged = new Map<string, VoicePaletteOption>();
		history.forEach((option) => merged.set(option.id, option));
		[...VOICE_SESSION_OPTIONS, ...VOICE_AGENT_OPTIONS].forEach((option) => {
			if (!merged.has(option.id)) {
				merged.set(option.id, option);
			}
		});
		return Array.from(merged.values());
	}, [sessionHistory]);

	const historyPreview = useMemo<VoicePaletteOption[]>(() => {
		return sessionHistory
			.slice()
			.sort((a, b) => b.lastUsed - a.lastUsed)
			.slice(0, 3)
			.map(({ lastUsed: _ignored, ...rest }) => rest);
	}, [sessionHistory]);

	const handleOptionSelect = useCallback(
		(option: VoicePaletteOption) => {
			addSessionHistory(option);
			onAgentSelect?.(option.id);
		},
		[addSessionHistory, onAgentSelect],
	);

	const handleMediaResult = useCallback(
		(event: VoiceMediaEvent) => {
			onMediaEvent?.(event);
			if (typeof window !== "undefined") {
				window.dispatchEvent(
					new CustomEvent("dealScale:focusWidget:mediaEvent", {
						detail: event,
					}),
				);
			}
		},
		[onMediaEvent],
	);

	const requestScreenShare = useCallback(async () => {
		setScreenError(null);
		setScreenStatus("pending");
		handleMediaResult({ type: "screen-share", status: "pending" });
		const devices =
			typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
		if (!devices || typeof devices.getDisplayMedia !== "function") {
			const message = "Screen sharing is not supported in this browser.";
			setScreenStatus("error");
			setScreenError(message);
			handleMediaResult({
				type: "screen-share",
				status: "denied",
				error: message,
			});
			return;
		}

		try {
			const stream = await devices.getDisplayMedia({
				video: { frameRate: 30 },
			});
			stream?.getTracks?.().forEach((track) => track.stop());
			setScreenStatus("active");
			handleMediaResult({ type: "screen-share", status: "granted" });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Screen share permission was declined.";
			setScreenStatus("error");
			setScreenError(message);
			handleMediaResult({
				type: "screen-share",
				status: "denied",
				error: message,
			});
		}
	}, [handleMediaResult]);

	const requestWebcam = useCallback(async () => {
		setWebcamError(null);
		setWebcamStatus("pending");
		handleMediaResult({ type: "webcam", status: "pending" });
		const devices =
			typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
		if (!devices || typeof devices.getUserMedia !== "function") {
			const message = "Webcam access is not available in this browser.";
			setWebcamStatus("error");
			setWebcamError(message);
			handleMediaResult({
				type: "webcam",
				status: "denied",
				error: message,
			});
			return;
		}

		try {
			const stream = await devices.getUserMedia({
				video: true,
				audio: false,
			});
			stream?.getTracks?.().forEach((track) => track.stop());
			setWebcamStatus("active");
			handleMediaResult({ type: "webcam", status: "granted" });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Webcam permission was declined.";
			setWebcamStatus("error");
			setWebcamError(message);
			handleMediaResult({
				type: "webcam",
				status: "denied",
				error: message,
			});
		}
	}, [handleMediaResult]);

	const browserHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
	const browserHoldIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const browserHoldStartRef = useRef<number | null>(null);
	const browserHoldCompletedRef = useRef(false);
	const HOLD_DURATION_MS = 1500;

	const clearBrowserHoldTimers = useCallback(() => {
		if (browserHoldTimerRef.current) {
			clearTimeout(browserHoldTimerRef.current);
			browserHoldTimerRef.current = null;
		}
		if (browserHoldIntervalRef.current) {
			clearInterval(browserHoldIntervalRef.current);
			browserHoldIntervalRef.current = null;
		}
		browserHoldStartRef.current = null;
	}, []);

	useEffect(() => {
		return () => {
			clearBrowserHoldTimers();
		};
	}, [clearBrowserHoldTimers]);

	const resetBrowserHold = useCallback(() => {
		clearBrowserHoldTimers();
		browserHoldCompletedRef.current = false;
		setIsHoldingBrowser(false);
		setBrowserHoldProgress(0);
		setBrowserAccessState("idle");
	}, [clearBrowserHoldTimers]);

	const handleBrowserPointerDown = useCallback(() => {
		if (!onRequestBrowserAccess) {
			return;
		}

		clearBrowserHoldTimers();
		browserHoldCompletedRef.current = false;
		setBrowserAccessState("pending");
		setBrowserHoldProgress(0);
		setIsHoldingBrowser(true);
		browserHoldStartRef.current = Date.now();

		browserHoldIntervalRef.current = setInterval(() => {
			if (!browserHoldStartRef.current) return;
			const elapsed = Date.now() - browserHoldStartRef.current;
			const progress = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
			setBrowserHoldProgress(progress);
		}, 50);

		browserHoldTimerRef.current = setTimeout(() => {
			clearBrowserHoldTimers();
			browserHoldCompletedRef.current = true;
			setIsHoldingBrowser(false);
			setBrowserHoldProgress(100);
			setBrowserAccessState("granted");
			onRequestBrowserAccess?.();
		}, HOLD_DURATION_MS);
	}, [HOLD_DURATION_MS, clearBrowserHoldTimers, onRequestBrowserAccess]);

	const handleBrowserPointerEnd = useCallback(() => {
		if (browserHoldCompletedRef.current) {
			browserHoldCompletedRef.current = false;
			return;
		}

		if (!browserHoldStartRef.current && !isHoldingBrowser) {
			return;
		}

		resetBrowserHold();
	}, [isHoldingBrowser, resetBrowserHold]);

	const browserProgressStyle =
		isHoldingBrowser || browserAccessState === "pending"
			? {
					background: `conic-gradient(hsl(var(--primary)) ${browserHoldProgress}%, rgba(255,255,255,0.08) ${browserHoldProgress}% 100%)`,
				}
			: undefined;

	const browserButtonIcon =
		browserAccessState === "granted" ? (
			<Check className="h-4 w-4" />
		) : browserAccessState === "pending" ? (
			<Loader2 className="h-4 w-4 animate-spin" />
		) : (
			<Globe className="h-4 w-4" />
		);

	const browserTooltipText =
		browserAccessState === "granted"
			? "Browser assistance enabled"
			: "Press and hold to enable browser assistance";

	return (
		<div className="relative flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-b from-secondary/30 to-background px-5 py-6 text-secondary-foreground">
			<motion.button
				type="button"
				onClick={onToggleAnimation}
				className={cn(
					"group relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition focus:outline-none focus:ring-2 focus:ring-primary/40",
					isAnimating
						? "bg-primary text-background"
						: "bg-primary/15 text-primary",
				)}
				aria-label={
					isAnimating ? "Pause voice capture" : "Resume voice capture"
				}
				aria-pressed={isAnimating}
				animate={{ scale: [1, 1.05, 1] }}
				transition={{
					duration: 2.4,
					repeat: Number.POSITIVE_INFINITY,
					repeatType: "loop",
				}}
			>
				<Lottie
					lottieRef={voiceLottieRef}
					className="pointer-events-none h-14 w-14"
					animationData={VoiceLottie}
					loop
					autoplay
				/>
				<span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-black/10 opacity-0 transition-opacity group-hover:opacity-10" />
			</motion.button>
			<TypewriterEffect
				words={(isAnimating
					? VOICE_PROMPTS
					: ["Voice capture paused.", "Tap the mic to resume AI narration."]
				).map((text) => ({ text }))}
				className="text-center font-semibold text-primary/90 text-xs leading-relaxed sm:text-sm"
				cursorClassName="bg-primary"
			/>
			{onRequestBrowserAccess ? (
				<div className="pointer-events-auto absolute left-4 top-4">
					<TooltipProvider delayDuration={150}>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									aria-label="Press and hold to enable browser assistance"
									onPointerDown={handleBrowserPointerDown}
									onPointerUp={handleBrowserPointerEnd}
									onPointerLeave={handleBrowserPointerEnd}
									onPointerCancel={handleBrowserPointerEnd}
									className={cn(
										"relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-background/70 text-primary shadow-md transition focus:outline-none focus:ring-2 focus:ring-primary/30",
										browserAccessState === "granted" &&
											"border-primary bg-primary text-primary-foreground",
									)}
								>
									<span
										className={cn(
											"absolute inset-0 rounded-full opacity-0 transition-opacity",
											(isHoldingBrowser || browserAccessState === "pending") &&
												"opacity-80",
										)}
										style={browserProgressStyle}
									/>
									<span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-background/70">
										{browserButtonIcon}
									</span>
								</button>
							</TooltipTrigger>
							<TooltipContent
								side="bottom"
								sideOffset={8}
								className="max-w-xs text-xs"
							>
								{browserTooltipText}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			) : null}
			<div className="pointer-events-auto absolute right-4 top-4">
				<TrackCommandPalette
					triggerLabel="Browse sessions and assistants"
					triggerVariant="icon"
					triggerIcon={
						<Sparkles className="h-5 w-5 text-primary" aria-hidden />
					}
					placeholder="Search agents, sessions, or tags"
					options={paletteOptions}
					onSelect={handleOptionSelect}
				/>
			</div>
			<div className="grid w-full max-w-sm grid-cols-2 gap-3">
				<MediaPermissionButton
					icon={MonitorUp}
					label="Share screen"
					status={screenStatus}
					message={screenMessage}
					onRequest={requestScreenShare}
				/>
				<MediaPermissionButton
					icon={Video}
					label="Share webcam"
					status={webcamStatus}
					message={webcamMessage}
					onRequest={requestWebcam}
				/>
			</div>
			<div className="flex w-full max-w-sm flex-col gap-3">
				<OptionStrip
					title="Sessions"
					options={VOICE_SESSION_OPTIONS}
					onSelect={handleOptionSelect}
				/>
				<OptionStrip
					title="Assistants"
					options={VOICE_AGENT_OPTIONS}
					onSelect={handleOptionSelect}
				/>
				{historyPreview.length > 0 ? (
					<OptionStrip
						title="Recent"
						options={historyPreview}
						onSelect={handleOptionSelect}
					/>
				) : null}
			</div>
			<p className="text-center text-[11px] text-primary/70">
				The AI co-pilot drafts transcripts while the mic pulse is active.
			</p>
		</div>
	);
}

type MediaPermissionButtonProps = {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	status: MediaStatus;
	message: { message: string; description: string };
	onRequest: () => void;
};

function MediaPermissionButton({
	icon: Icon,
	label,
	status,
	message,
	onRequest,
}: MediaPermissionButtonProps) {
	const isPending = status === "pending";
	const isActive = status === "active";
	const isError = status === "error";
	const buttonClasses = cn(
		"flex h-11 w-full items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary/40",
		isActive
			? "border-primary/50 bg-primary/10 text-primary"
			: "border-primary/20 bg-primary/5 text-primary/80 hover:border-primary/40 hover:bg-primary/10",
		isError && "border-destructive/40 bg-destructive/10 text-destructive",
	);

	return (
		<div className="flex flex-col gap-1.5 rounded-xl bg-background/40 p-3">
			<button
				type="button"
				onClick={onRequest}
				className={buttonClasses}
				disabled={isPending}
				aria-pressed={isActive}
			>
				<Icon className="h-5 w-5" aria-hidden />
				<span className="sr-only">{label}</span>
			</button>
			<div className="flex flex-col text-xs text-primary/70">
				<strong aria-live="polite" className="font-semibold text-primary">
					{message.message}
				</strong>
				<span className="leading-tight text-primary/60">
					{message.description}
				</span>
				{isError ? (
					<button
						type="button"
						className="mt-1 self-start rounded-full border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary/80 transition hover:border-primary/40 hover:text-primary"
						onClick={onRequest}
					>
						Try again
					</button>
				) : null}
			</div>
		</div>
	);
}

type OptionStripProps = {
	title: string;
	options: readonly VoicePaletteOption[];
	onSelect: (option: VoicePaletteOption) => void;
};

function OptionStrip({ title, options, onSelect }: OptionStripProps) {
	const limited = options.slice(0, 4);
	return (
		<section className="flex flex-col gap-1">
			<h3 className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">
				{title}
			</h3>
			<div className="flex gap-2 overflow-x-auto pb-1">
				{limited.map((option) => (
					<button
						key={option.id}
						type="button"
						className="flex min-w-[120px] flex-col gap-1 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-left transition hover:border-primary/40 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40"
						onClick={() => onSelect(option)}
					>
						<span className="text-[12px] font-semibold text-primary">
							{option.name}
						</span>
						{option.description ? (
							<span className="text-[10px] text-primary/70">
								{option.description}
							</span>
						) : null}
					</button>
				))}
			</div>
		</section>
	);
}
