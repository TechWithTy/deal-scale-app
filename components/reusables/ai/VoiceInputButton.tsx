/**
 * Voice Input Button Component
 * Stateful button for speech-to-text with mock functionality
 * Integrates with AI generators for voice-powered prompt creation
 */

"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mic, MicOff, Loader2, Check, AlertCircle, Square } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/_utils";

export type VoiceInputState =
	| "idle"
	| "requesting_permission"
	| "listening"
	| "processing"
	| "success"
	| "error";

export interface VoiceInputButtonProps {
	/** Called when transcription is complete */
	onTranscription: (text: string) => void;
	/** Mode: replace current text or append to it */
	mode?: "replace" | "append";
	/** Language for speech recognition */
	language?: string;
	/** Maximum recording duration in seconds */
	maxDuration?: number;
	/** Button size */
	size?: "default" | "sm" | "lg" | "icon";
	/** Button variant */
	variant?: "default" | "outline" | "ghost" | "secondary";
	/** Additional CSS classes */
	className?: string;
	/** Disabled state */
	disabled?: boolean;
	/** Show label next to icon */
	showLabel?: boolean;
	/** Custom label */
	label?: string;
}

export function VoiceInputButton({
	onTranscription,
	mode = "append",
	language = "en-US",
	maxDuration = 60,
	size = "icon",
	variant = "outline",
	className,
	disabled = false,
	showLabel = false,
	label,
}: VoiceInputButtonProps) {
	const [state, setState] = useState<VoiceInputState>("idle");
	const [duration, setDuration] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Mock transcriptions for testing
	const mockTranscriptions = [
		"Create a campaign targeting tech executives in San Francisco with personalized outreach",
		"Generate a workflow that enriches leads from Apollo and sends automated follow-up emails",
		"Find companies in the software industry with 50 to 100 employees located in California",
		"Set up an automation to follow up with leads after 3 days if they haven't responded",
		"Build a search for SaaS companies that raised Series A funding in the last 6 months",
		"Design a multi-channel campaign for enterprise decision makers in the finance sector",
	];

	// Cleanup function
	const cleanup = useCallback(() => {
		if (durationIntervalRef.current) {
			clearInterval(durationIntervalRef.current);
			durationIntervalRef.current = null;
		}
		if (maxDurationTimeoutRef.current) {
			clearTimeout(maxDurationTimeoutRef.current);
			maxDurationTimeoutRef.current = null;
		}
		setDuration(0);
	}, []);

	// Handle voice input toggle
	const handleVoiceInput = async () => {
		if (state === "listening") {
			// Stop recording
			stopRecording();
		} else if (state === "idle") {
			// Start recording
			startRecording();
		}
	};

	const startRecording = async () => {
		setError(null);
		setState("requesting_permission");

		// Simulate permission request
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Mock: 5% chance of permission denied
		if (Math.random() < 0.05) {
			setError("Microphone permission denied");
			setState("error");
			toast.error("Microphone permission denied", {
				description: "Please allow microphone access to use voice input",
			});
			setTimeout(() => setState("idle"), 3000);
			return;
		}

		// Start listening
		setState("listening");
		setDuration(0);

		toast.info("Listening...", {
			description: "Speak your prompt clearly",
			duration: 2000,
		});

		// Start duration counter
		durationIntervalRef.current = setInterval(() => {
			setDuration((prev) => prev + 1);
		}, 1000);

		// Auto-stop at max duration
		maxDurationTimeoutRef.current = setTimeout(() => {
			stopRecording();
		}, maxDuration * 1000);
	};

	const stopRecording = async () => {
		cleanup();
		setState("processing");

		// Simulate processing delay
		await new Promise((resolve) =>
			setTimeout(resolve, 800 + Math.random() * 700),
		);

		// Mock: 10% chance of error
		if (Math.random() < 0.1) {
			const errors = ["No speech detected", "Audio too quiet", "Network error"];
			const randomError = errors[Math.floor(Math.random() * errors.length)];
			setError(randomError);
			setState("error");
			toast.error("Voice input failed", {
				description: randomError,
			});
			setTimeout(() => setState("idle"), 3000);
			return;
		}

		// Mock: Generate transcription
		const transcription =
			mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

		// Success!
		setState("success");
		onTranscription(transcription);
		toast.success("Transcribed successfully!", {
			description: `${transcription.slice(0, 50)}...`,
			duration: 3000,
		});

		// Reset to idle
		setTimeout(() => {
			setState("idle");
			setError(null);
		}, 2000);
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => cleanup();
	}, [cleanup]);

	// Get button appearance based on state
	const getButtonConfig = () => {
		switch (state) {
			case "idle":
				return {
					icon: <Mic className="h-4 w-4" />,
					label: label || "Voice input",
					tooltip: "Voice input (Ctrl+Shift+V)",
					className: "hover:text-primary",
					pulse: false,
				};
			case "requesting_permission":
				return {
					icon: <Loader2 className="h-4 w-4 animate-spin" />,
					label: "Requesting...",
					tooltip: "Requesting microphone permission",
					className: "text-blue-600",
					pulse: false,
				};
			case "listening":
				return {
					icon: <Square className="h-3 w-3 fill-current" />,
					label: `Recording... (${duration}s)`,
					tooltip: `Recording... ${duration}s / ${maxDuration}s`,
					className: "text-red-600 animate-pulse",
					pulse: true,
				};
			case "processing":
				return {
					icon: <Loader2 className="h-4 w-4 animate-spin" />,
					label: "Processing...",
					tooltip: "Processing speech...",
					className: "text-blue-600",
					pulse: false,
				};
			case "success":
				return {
					icon: <Check className="h-4 w-4" />,
					label: "Success!",
					tooltip: "Transcribed successfully!",
					className: "text-green-600",
					pulse: false,
				};
			case "error":
				return {
					icon: <AlertCircle className="h-4 w-4" />,
					label: "Error",
					tooltip: error || "An error occurred",
					className: "text-red-600",
					pulse: false,
				};
		}
	};

	const config = getButtonConfig();

	// Keyboard shortcut (Ctrl/Cmd + Shift + V)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				(e.ctrlKey || e.metaKey) &&
				e.shiftKey &&
				e.key.toLowerCase() === "v"
			) {
				e.preventDefault();
				if (!disabled && state === "idle") {
					handleVoiceInput();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [disabled, state]);

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						size={size}
						variant={variant}
						onClick={handleVoiceInput}
						disabled={
							disabled ||
							state === "requesting_permission" ||
							state === "processing" ||
							state === "success"
						}
						className={cn(
							"relative transition-all",
							config.className,
							config.pulse && "shadow-lg shadow-red-500/50",
							className,
						)}
					>
						{config.icon}
						{showLabel && (
							<span className="ml-2 hidden sm:inline">{config.label}</span>
						)}
						{/* Progress ring for recording */}
						{state === "listening" && (
							<svg
								className="absolute inset-0 h-full w-full -rotate-90"
								viewBox="0 0 36 36"
							>
								<circle
									className="stroke-current text-red-600/20"
									strokeWidth="2"
									fill="none"
									cx="18"
									cy="18"
									r="16"
								/>
								<circle
									className="stroke-current text-red-600 transition-all duration-1000 ease-linear"
									strokeWidth="2"
									strokeLinecap="round"
									fill="none"
									cx="18"
									cy="18"
									r="16"
									strokeDasharray={`${(duration / maxDuration) * 100} 100`}
								/>
							</svg>
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="top" className="max-w-[200px]">
					<div className="space-y-1">
						<p className="text-xs font-medium">{config.tooltip}</p>
						{state === "idle" && (
							<p className="text-[10px] text-muted-foreground">
								Mode: {mode === "append" ? "Append" : "Replace"}
							</p>
						)}
						{state === "listening" && (
							<div className="space-y-0.5">
								<p className="text-[10px] text-muted-foreground">
									Click or press Space to stop
								</p>
								<div className="h-1 w-full overflow-hidden rounded-full bg-red-600/20">
									<div
										className="h-full bg-red-600 transition-all duration-1000 ease-linear"
										style={{
											width: `${(duration / maxDuration) * 100}%`,
										}}
									/>
								</div>
							</div>
						)}
						{error && state === "error" && (
							<p className="text-[10px] text-red-500">{error}</p>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

/**
 * Compact variant for inline use
 */
export function VoiceInputButtonCompact(
	props: Omit<VoiceInputButtonProps, "size" | "variant" | "showLabel">,
) {
	return (
		<VoiceInputButton
			{...props}
			size="icon"
			variant="ghost"
			showLabel={false}
		/>
	);
}

/**
 * Full variant with label
 */
export function VoiceInputButtonFull(
	props: Omit<VoiceInputButtonProps, "size" | "variant" | "showLabel">,
) {
	return (
		<VoiceInputButton
			{...props}
			size="default"
			variant="outline"
			showLabel={true}
		/>
	);
}
