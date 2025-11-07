"use client";

import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { motion } from "motion/react";
import type React from "react";

import { TrackCommandPalette } from "@/components/ui/track-command-palette";
import { cn } from "@/lib/utils";
import VoiceLottie from "@/public/lottie/RecordingButton.json";
import { TypewriterEffect } from "../typewriter-effect";
import { VOICE_AGENT_OPTIONS, VOICE_PROMPTS } from "./constants";

interface VoiceModePanelProps {
	isAnimating: boolean;
	onToggleAnimation: () => void;
	voiceLottieRef: React.MutableRefObject<LottieRefCurrentProps | null>;
	onAgentSelect?: (agentId: string) => void;
}

export function VoiceModePanel({
	isAnimating,
	onToggleAnimation,
	voiceLottieRef,
	onAgentSelect,
}: VoiceModePanelProps): React.ReactElement {
	return (
		<div className="relative flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-secondary/30 to-background px-5 py-6 text-secondary-foreground">
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
			<TrackCommandPalette
				triggerLabel="Switch voice agent"
				placeholder="Search agents, prompts, or tags"
				options={[...VOICE_AGENT_OPTIONS]}
				onSelect={(option) => onAgentSelect?.(option.id)}
			/>
			<p className="text-center text-[11px] text-primary/70">
				The AI co-pilot drafts transcripts while the mic pulse is active.
			</p>
		</div>
	);
}
