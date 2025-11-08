import type { VoicePaletteOption } from "@/types/focus";
import type { MusicWidgetPosition } from "@/lib/stores/musicPreferences";

export const WIDGET_WIDTH = 300;
export const WIDGET_MIN_WIDTH = 240;
export const WIDGET_MAX_WIDTH = 384;
export const MUSIC_HEIGHT = 180;
export const VOICE_HEIGHT = 240;
export const MUSIC_MIN_HEIGHT = 150;
export const VOICE_MIN_HEIGHT = 200;
export const MUSIC_MAX_HEIGHT = 320;
export const VOICE_MAX_HEIGHT = 360;
export const SNAP_THRESHOLD = 50;
export const SNAP_MARGIN = 8;
export const DEFAULT_OFFSET = 16;
export const DEFAULT_PLAYLIST_URI = "spotify:playlist:37i9dQZF1DX8Uebhn9wzrS";

export const DEFAULT_WIDGET_HEIGHTS = {
	music: MUSIC_HEIGHT,
	voice: VOICE_HEIGHT,
} as const;

export const VOICE_PROMPTS = [
	"Synthesizing DealScale voice insights.",
	"Streaming focus prompts to your workspace.",
	"Rendering conversational tone analysis.",
	"Preparing briefing for next outreach sprint.",
] as const;

export const VOICE_SESSION_OPTIONS: VoicePaletteOption[] = [
	{
		id: "session-25-5",
		name: "Deep Focus 25/5",
		category: "Sessions",
		types: ["session", "pomodoro", "music"],
		description:
			"Structured 25 minute focus blocks followed by 5 minute resets.",
	},
	{
		id: "session-50",
		name: "Strategy Sprint 50",
		category: "Sessions",
		types: ["session", "analysis"],
		description:
			"Long-form planning loop for deep work, competitive research, or storyboarding.",
	},
	{
		id: "session-open-collab",
		name: "Open Collaboration",
		category: "Sessions",
		types: ["session", "meet"],
		description:
			"Drop-in collaborative flow designed for live coaching or pair sessions.",
	},
] as const;

export const VOICE_AGENT_OPTIONS: VoicePaletteOption[] = [
	{
		id: "ai-clone",
		name: "DealScale AI Clone",
		category: "AI Voices",
		types: ["clone", "warm-up"],
		description:
			"Mirrors your tone to draft scripts, outreach, and agent-ready transcriptions.",
	},
	{
		id: "focus-director",
		name: "Focus Flow Director",
		category: "Coaching",
		types: ["coaching", "analytics"],
		description:
			"Guides focus cadence, shares prompts, and tracks progress across sessions.",
	},
	{
		id: "outreach-mentor",
		name: "Outreach Mentor",
		category: "Assistants",
		types: ["voicemail", "scripting"],
		description:
			"Generates adaptive call scripts, objection handling, and follow-up prompts.",
	},
] as const;

export const DEFAULT_WIDGET_WIDTH = WIDGET_WIDTH;

export const MIN_WIDGET_HEIGHTS = {
	music: MUSIC_MIN_HEIGHT,
	voice: VOICE_MIN_HEIGHT,
} as const;

export const MAX_WIDGET_HEIGHTS = {
	music: MUSIC_MAX_HEIGHT,
	voice: VOICE_MAX_HEIGHT,
} as const;

export function computeDefaultPosition(): MusicWidgetPosition {
	return { x: DEFAULT_OFFSET, y: DEFAULT_OFFSET, anchor: "top-left" };
}
