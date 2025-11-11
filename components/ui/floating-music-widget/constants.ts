import type { VoicePaletteOption, VoiceSessionOption } from "@/types/focus";
import type { MusicWidgetPosition } from "@/lib/stores/musicPreferences";

export const WIDGET_WIDTH = 300;
export const WIDGET_MIN_WIDTH = 240;
export const WIDGET_MAX_WIDTH = 384;
export const MUSIC_HEIGHT = 180;
export const VOICE_HEIGHT = 240;
export const VIDEO_HEIGHT = 260;
export const PHONE_HEIGHT = 250;
export const WIDGET_MINIMIZED_HEIGHT = 72;
export const MUSIC_MIN_HEIGHT = 150;
export const VOICE_MIN_HEIGHT = 200;
export const VIDEO_MIN_HEIGHT = 220;
export const PHONE_MIN_HEIGHT = 210;
export const MUSIC_MAX_HEIGHT = 320;
export const VOICE_MAX_HEIGHT = 360;
export const VIDEO_MAX_HEIGHT = 380;
export const PHONE_MAX_HEIGHT = 360;
export const SNAP_THRESHOLD = 50;
export const SNAP_MARGIN = 8;
export const DEFAULT_OFFSET = 16;
export const DEFAULT_PLAYLIST_URI = "spotify:playlist:37i9dQZF1DX8Uebhn9wzrS";

export const DEFAULT_WIDGET_HEIGHTS = {
	music: MUSIC_HEIGHT,
	voice: VOICE_HEIGHT,
	video: VIDEO_HEIGHT,
	phone: PHONE_HEIGHT,
} as const;
export const VOICE_PROMPTS = [
	"Synthesizing DealScale voice insights.",
	"Streaming focus prompts to your workspace.",
	"Rendering conversational tone analysis.",
	"Preparing briefing for next outreach sprint.",
] as const;

export const VIDEO_PROMPTS = [
	"Routing live DealScale avatar feed.",
	"Streaming stage-ready overlays to your workspace.",
	"Balancing real-time coaching with visual insights.",
] as const;

export const PHONE_PROMPTS = [
	"Ready to dial prospects with AI-assisted talk tracks.",
	"Syncing call scripts with SMS drip sequencing.",
	"Logging conversations and transcribing call outcomes.",
] as const;

export const VOICE_SESSION_OPTIONS: VoiceSessionOption[] = [
	{
		id: "session-new",
		name: "Start New Session",
		category: "My Sessions",
		types: ["session", "create"],
		description: "Open a fresh workspace for your AI co-pilot.",
		icon: "sparkles",
	},
] as const;

export const VOICE_AGENT_OPTIONS: VoicePaletteOption[] = [
	{
		id: "ai-clone",
		name: "DealScale AI Clone",
		category: "AI Agents (A2A)",
		types: ["agent", "clone", "warm-up"],
		description:
			"Mirrors your tone to draft scripts, outreach, and agent-ready transcriptions.",
	},
	{
		id: "focus-director",
		name: "Focus Flow Director",
		category: "AI Agents (A2A)",
		types: ["agent", "coaching", "analytics"],
		description:
			"Guides focus cadence, shares prompts, and tracks progress across sessions.",
	},
	{
		id: "outreach-mentor",
		name: "Outreach Mentor",
		category: "AI Agents (A2A)",
		types: ["agent", "voicemail", "scripting"],
		description:
			"Generates adaptive call scripts, objection handling, and follow-up prompts.",
	},
] as const;

export const VOICE_ASSET_OPTIONS: VoicePaletteOption[] = [
	{
		id: "prompt-market-intro",
		name: "Market Intro Asset",
		category: "Resources & Files",
		types: ["resource", "prompt", "intro", "market"],
		description: "AI greeting tailored to new market segments.",
	},
	{
		id: "prompt-seller-objection",
		name: "Seller Objection Asset",
		category: "Resources & Files",
		types: ["resource", "prompt", "objection", "seller"],
		description: "Handles common seller concerns with empathy.",
	},
] as const;

export const VOICE_SPRINT_OPTIONS: VoicePaletteOption[] = [
	{
		id: "sprint-25-5",
		name: "Deep Focus 25/5",
		category: "Sprints",
		types: ["sprint", "pomodoro", "music"],
		description:
			"Structured 25 minute focus blocks followed by 5 minute resets.",
		icon: "timer",
	},
	{
		id: "sprint-50",
		name: "Strategy Sprint 50",
		category: "Sprints",
		types: ["sprint", "analysis"],
		description:
			"Long-form planning loop for deep work, competitive research, or storyboarding.",
		icon: "target",
	},
	{
		id: "sprint-open-collab",
		name: "Open Collaboration",
		category: "Sprints",
		types: ["sprint", "meet"],
		description:
			"Drop-in collaborative flow designed for live coaching or pair sessions.",
		icon: "users",
	},
] as const;

export const DEFAULT_WIDGET_WIDTH = WIDGET_WIDTH;

export const MIN_WIDGET_HEIGHTS = {
	music: MUSIC_MIN_HEIGHT,
	voice: VOICE_MIN_HEIGHT,
	video: VIDEO_MIN_HEIGHT,
	phone: PHONE_MIN_HEIGHT,
} as const;

export const MAX_WIDGET_HEIGHTS = {
	music: MUSIC_MAX_HEIGHT,
	voice: VOICE_MAX_HEIGHT,
	video: VIDEO_MAX_HEIGHT,
	phone: PHONE_MAX_HEIGHT,
} as const;

export function computeDefaultPosition(): MusicWidgetPosition {
	return { x: DEFAULT_OFFSET, y: DEFAULT_OFFSET, anchor: "top-left" };
}
