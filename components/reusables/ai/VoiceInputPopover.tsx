/**
 * Voice Input Popover Component
 * Provides Speech-to-Text and AI Enhance options for voice-powered prompt creation
 */

"use client";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Mic,
	Sparkles,
	Info,
	Loader2,
	MicOff,
	AlertCircle,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/_utils";
import type { ChipDefinition } from "./InlineChipEditor";

export interface VoiceInputPopoverProps {
	/** Current prompt value for AI enhancement context */
	promptValue: string;
	/** Called when text should be added to prompt */
	onTranscription: (text: string, isEnhanced?: boolean) => void;
	/** Mode: replace current text or append to it */
	mode?: "replace" | "append";
	/** Language for speech recognition */
	language?: string;
	/** Maximum recording duration in seconds */
	maxDuration?: number;
	/** Disabled state */
	disabled?: boolean;
	/** Available chips for AI enhancement */
	availableChips?: ChipDefinition[];
	/** Additional CSS classes */
	className?: string;
}

type VoiceState = "idle" | "listening" | "processing" | "error";
type VoiceMode = "stt" | "ai-enhance" | null;

export function VoiceInputPopover({
	promptValue,
	onTranscription,
	mode = "append",
	language = "en-US",
	maxDuration = 60,
	disabled = false,
	availableChips = [],
	className,
}: VoiceInputPopoverProps) {
	const [open, setOpen] = useState(false);
	const [voiceState, setVoiceState] = useState<VoiceState>("idle");
	const [activeMode, setActiveMode] = useState<VoiceMode>(null);
	const [duration, setDuration] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Mock transcriptions for testing
	const mockTranscriptions = [
		"Create a campaign targeting tech executives in San Francisco",
		"Generate a workflow that enriches leads from Apollo",
		"Find companies in the software industry with 50 to 100 employees",
		"Set up an automation to follow up with leads after 3 days",
		"Build a search for SaaS companies that raised Series A funding",
		"Design a multi-channel campaign for enterprise decision makers",
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

	// Cleanup on unmount
	useEffect(() => {
		return () => cleanup();
	}, [cleanup]);

	// Start recording
	const startRecording = useCallback(
		async (selectedMode: VoiceMode) => {
			if (!selectedMode) return;

			setError(null);
			setActiveMode(selectedMode);
			setVoiceState("listening");
			setDuration(0);

			// Close popover to show recording state
			setOpen(false);

			// Edge case: Check microphone permission
			try {
				await navigator.mediaDevices.getUserMedia({ audio: true });
			} catch (err) {
				setError("Microphone permission denied");
				setVoiceState("error");
				toast.error("Microphone Access Denied", {
					description: "Please allow microphone access to use voice input",
				});
				setTimeout(() => {
					setVoiceState("idle");
					setActiveMode(null);
				}, 3000);
				return;
			}

			toast.info(
				selectedMode === "stt"
					? "Listening..."
					: "Listening for AI enhancement...",
				{
					description: "Speak clearly and naturally",
					duration: 2000,
				},
			);

			// Start duration counter
			durationIntervalRef.current = setInterval(() => {
				setDuration((prev) => prev + 1);
			}, 1000);

			// Auto-stop at max duration
			maxDurationTimeoutRef.current = setTimeout(() => {
				stopRecording();
			}, maxDuration * 1000);
		},
		[maxDuration],
	);

	// Stop recording and process
	const stopRecording = useCallback(async () => {
		cleanup();
		setVoiceState("processing");

		// Simulate processing delay
		await new Promise((resolve) =>
			setTimeout(resolve, 800 + Math.random() * 700),
		);

		// Edge case: Network error simulation (10% chance)
		if (Math.random() < 0.1) {
			const errors = [
				"No speech detected",
				"Audio too quiet",
				"Network error - please try again",
			];
			const randomError = errors[Math.floor(Math.random() * errors.length)];
			setError(randomError);
			setVoiceState("error");
			toast.error("Voice Input Failed", {
				description: randomError,
			});
			setTimeout(() => {
				setVoiceState("idle");
				setActiveMode(null);
			}, 3000);
			return;
		}

		// Mock: Generate transcription
		const baseTranscription =
			mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

		// Edge case: Empty transcription
		if (!baseTranscription.trim()) {
			setError("No speech detected");
			setVoiceState("error");
			toast.error("No Speech Detected", {
				description: "Please try again and speak clearly",
			});
			setTimeout(() => {
				setVoiceState("idle");
				setActiveMode(null);
			}, 3000);
			return;
		}

		let finalText = baseTranscription;
		let isEnhanced = false;

		// Apply AI enhancement if selected
		if (activeMode === "ai-enhance") {
			try {
				finalText = await enhancePromptWithAI(
					baseTranscription,
					availableChips,
				);
				isEnhanced = true;
			} catch (enhanceError) {
				// Edge case: AI enhancement fails, fallback to basic transcription
				console.error("AI enhancement failed:", enhanceError);
				toast.warning("AI Enhancement Unavailable", {
					description: "Using basic transcription instead",
					duration: 3000,
				});
				finalText = baseTranscription;
				isEnhanced = false;
			}
		}

		// Success!
		setVoiceState("idle");
		setActiveMode(null);
		onTranscription(finalText, isEnhanced);

		toast.success(
			isEnhanced ? "AI Enhanced Prompt Created!" : "Transcribed Successfully!",
			{
				description: `${finalText.slice(0, 60)}${finalText.length > 60 ? "..." : ""}`,
				duration: 3000,
			},
		);
	}, [activeMode, availableChips, cleanup, onTranscription]);

	// Handle click on recording button (stops recording)
	const handleRecordingClick = useCallback(() => {
		if (voiceState === "listening") {
			stopRecording();
		}
	}, [voiceState, stopRecording]);

	// Keyboard shortcut (Space) to stop recording
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (voiceState === "listening" && e.key === " ") {
				e.preventDefault();
				stopRecording();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [voiceState, stopRecording]);

	// Get button appearance based on state
	const getButtonIcon = () => {
		switch (voiceState) {
			case "listening":
				return <Mic className="h-4 w-4 animate-pulse" />;
			case "processing":
				return <Loader2 className="h-4 w-4 animate-spin" />;
			case "error":
				return <AlertCircle className="h-4 w-4" />;
			default:
				return <Mic className="h-4 w-4" />;
		}
	};

	// If currently recording/processing, show the recording button instead
	if (voiceState !== "idle") {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							type="button"
							size="icon"
							variant="ghost"
							onClick={handleRecordingClick}
							disabled={voiceState === "processing"}
							className={cn(
								"relative transition-all",
								voiceState === "listening" &&
									"bg-red-500/20 text-red-600 hover:bg-red-500/30 hover:text-red-600 shadow-lg shadow-red-500/50 animate-pulse",
								voiceState === "processing" && "text-blue-600",
								voiceState === "error" && "text-red-600",
								className,
							)}
						>
							{getButtonIcon()}
							{/* Progress ring for recording */}
							{voiceState === "listening" && (
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
					<TooltipContent side="top">
						{voiceState === "listening" && (
							<div className="space-y-1">
								<p className="text-xs font-medium">
									Recording... ({duration}s / {maxDuration}s)
								</p>
								<p className="text-[10px] text-muted-foreground">
									Click or press Space to stop
								</p>
							</div>
						)}
						{voiceState === "processing" && (
							<p className="text-xs">Processing speech...</p>
						)}
						{voiceState === "error" && (
							<p className="text-xs text-red-500">{error}</p>
						)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	// Default state: Show popover trigger
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<PopoverTrigger asChild>
							<Button
								type="button"
								size="icon"
								variant="ghost"
								disabled={disabled}
								className={cn(
									"relative transition-all duration-300 hover:scale-105",
									"bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20",
									"hover:from-primary/30 hover:via-purple-500/30 hover:to-blue-500/30",
									"border border-primary/30 shadow-lg shadow-primary/20",
									"animate-pulse-subtle",
									className,
								)}
							>
								<Mic className="h-4 w-4 text-primary" />
							</Button>
						</PopoverTrigger>
					</TooltipTrigger>
					<TooltipContent side="top">
						<p className="text-xs font-medium">Voice Input</p>
						<p className="text-[10px] text-muted-foreground">
							Speech-to-text or AI enhance
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<PopoverContent
				className="w-80 p-3"
				side="top"
				align="end"
				sideOffset={8}
			>
				<div className="space-y-2">
					<div className="mb-3">
						<h4 className="font-semibold text-sm">Voice Input Options</h4>
						<p className="text-muted-foreground text-xs mt-1">
							Choose how to process your voice
						</p>
					</div>

					{/* Speech-to-Text Option */}
					<Button
						type="button"
						variant="outline"
						className="w-full justify-start h-auto py-3 px-3 hover:bg-accent/50 transition-colors"
						onClick={() => startRecording("stt")}
					>
						<div className="flex items-start gap-3 w-full">
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
								<Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div className="flex-1 text-left">
								<div className="flex items-center gap-1.5 mb-1">
									<span className="font-semibold text-sm">Speech-to-Text</span>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="inline-flex items-center justify-center hover:bg-accent rounded-full p-0.5"
													onClick={(e) => e.stopPropagation()}
												>
													<Info className="h-3.5 w-3.5 text-muted-foreground" />
												</button>
											</TooltipTrigger>
											<TooltipContent side="top" className="max-w-xs">
												<p className="text-xs">
													Direct transcription of your spoken words into text.
													Perfect for dictating existing prompts.
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Direct transcription of your spoken words
								</p>
							</div>
						</div>
					</Button>

					{/* AI Enhance Option */}
					<Button
						type="button"
						variant="outline"
						className="w-full justify-start h-auto py-3 px-3 hover:bg-accent/50 transition-colors"
						onClick={() => startRecording("ai-enhance")}
					>
						<div className="flex items-start gap-3 w-full">
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-primary/20">
								<Sparkles className="h-5 w-5 text-primary" />
							</div>
							<div className="flex-1 text-left">
								<div className="flex items-center gap-1.5 mb-1">
									<span className="font-semibold text-sm">AI Enhance</span>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="inline-flex items-center justify-center hover:bg-accent rounded-full p-0.5"
													onClick={(e) => e.stopPropagation()}
												>
													<Info className="h-3.5 w-3.5 text-muted-foreground" />
												</button>
											</TooltipTrigger>
											<TooltipContent side="top" className="max-w-xs">
												<p className="text-xs">
													AI takes your words and creates an optimized POML
													prompt with appropriate variables, chips, and
													structure. Intelligently inserts context like{" "}
													<code className="text-[10px] bg-muted px-1 py-0.5 rounded">
														{`{{firstName}}`}
													</code>{" "}
													when you say "first name".
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed">
									Create optimized prompts with smart variable insertion
								</p>
							</div>
						</div>
					</Button>

					{/* Edge case: No chips available warning */}
					{availableChips.length === 0 && (
						<div className="mt-2 rounded-md bg-yellow-500/10 border border-yellow-500/20 p-2">
							<p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-1.5">
								<AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
								<span>
									No variables available for AI enhancement. Speech-to-Text will
									work normally.
								</span>
							</p>
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

/**
 * AI Enhancement Logic
 * Analyzes transcribed text and intelligently inserts appropriate chips/variables
 */
async function enhancePromptWithAI(
	transcription: string,
	availableChips: ChipDefinition[],
): Promise<string> {
	// Simulate AI processing delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	// Edge case: No transcription
	if (!transcription.trim()) {
		throw new Error("Empty transcription");
	}

	// Edge case: No chips available
	if (availableChips.length === 0) {
		return transcription;
	}

	let enhanced = transcription;

	// Smart keyword mapping to chips
	const keywordMappings: Record<string, string[]> = {
		// Common lead fields
		firstName: ["first name", "given name", "fname"],
		lastName: ["last name", "surname", "family name", "lname"],
		fullName: ["full name", "complete name", "name"],
		email: ["email", "email address", "e-mail"],
		phone: ["phone", "phone number", "telephone", "mobile"],
		company: ["company", "business", "organization", "firm"],
		title: ["title", "job title", "position", "role"],

		// Location fields
		city: ["city", "town"],
		state: ["state", "province"],
		country: ["country", "nation"],
		address: ["address", "location", "street address"],

		// Other common fields
		industry: ["industry", "sector", "field"],
		revenue: ["revenue", "income", "earnings"],
		employees: ["employees", "team size", "headcount"],
	};

	// Build reverse mapping for efficient lookup
	const keywordToChip = new Map<string, string>();
	for (const [chipKey, keywords] of Object.entries(keywordMappings)) {
		// Check if this chip exists in available chips
		const chipExists = availableChips.some((c) => c.key === chipKey);
		if (chipExists) {
			for (const keyword of keywords) {
				keywordToChip.set(keyword.toLowerCase(), chipKey);
			}
		}
	}

	// Replace keywords with chip syntax (case-insensitive)
	for (const [keyword, chipKey] of keywordToChip.entries()) {
		const regex = new RegExp(`\\b${keyword}\\b`, "gi");
		enhanced = enhanced.replace(regex, `{{${chipKey}}}`);
	}

	// Add POML structure if it contains certain keywords
	const hasStructure = /\b(create|generate|build|make)\b/i.test(enhanced);
	const hasAction = /\b(send|email|call|text|message|contact)\b/i.test(
		enhanced,
	);
	const hasFilter = /\b(where|with|having|in|from)\b/i.test(enhanced);

	if (hasStructure && hasAction) {
		// Wrap in basic POML structure
		enhanced = `<task>
  ${enhanced}
</task>`;
	} else if (hasFilter) {
		// Add context tag for filtering
		enhanced = `<context>
  ${enhanced}
</context>`;
	}

	return enhanced;
}
