export type VoiceSessionOption = {
	id: string;
	name: string;
	category: string;
	types: string[];
	description?: string;
	icon?: string;
	bookmarked?: boolean;
};

export type VoicePaletteOption = VoiceSessionOption & {
	badge?: string;
};

export type VoiceSessionHistoryEntry = VoiceSessionOption & {
	lastUsed: number;
};
