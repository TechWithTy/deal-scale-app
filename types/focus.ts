export type VoicePaletteOption = {
	id: string;
	name: string;
	category: string;
	types: string[];
	description?: string;
	badge?: string;
};

export type VoiceSessionHistoryEntry = VoicePaletteOption & {
	lastUsed: number;
};
