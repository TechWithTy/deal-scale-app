import type { TrackAgentOption } from "@/components/ui/track-command-palette";
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

export const VOICE_AGENT_OPTIONS: TrackAgentOption[] = [
	{
		id: "ai-clone",
		name: "DealScale AI Clone",
		category: "AI Voices",
		types: ["clone", "warm-up"],
	},
	{
		id: "focus-director",
		name: "Focus Flow Director",
		category: "Coaching",
		types: ["coaching", "analytics"],
	},
	{
		id: "outreach-mentor",
		name: "Outreach Mentor",
		category: "Assistants",
		types: ["voicemail", "scripting"],
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
