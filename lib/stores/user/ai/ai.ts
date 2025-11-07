import { MockUserProfile } from "@/constants/_faker/profile/userProfile";
import type { UserProfile } from "@/types/userProfile";
import type { AIKnowledgebase } from "@/types/userProfile";
import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";
import { create } from "zustand";

export interface AISettingsState {
	assistantId: string | null;
	squadId: string | null;
	customVoiceId: string | null;
	voicemailFile: string | null;
	voices: AssistantVoice[];
	avatar?: AIKnowledgebase["aiAvatar"];
	background?: AIKnowledgebase["background"];
	setAssistantId: (id: string | null) => void;
	setSquadId: (id: string | null) => void;
	setCustomVoiceId: (id: string | null) => void;
	setVoicemailFile: (file: string | null) => void;
	setVoices: (voices: AssistantVoice[]) => void;
	setAvatar: (avatar?: AIKnowledgebase["aiAvatar"]) => void;
	setBackground: (bg?: AIKnowledgebase["background"]) => void;
	hydrateFromProfile: (profile?: UserProfile | null) => void;
	reset: () => void;
}

function initialFromProfile(profile?: UserProfile | null) {
	const kb = profile?.aIKnowledgebase;
	const rec = kb?.recordings;
	return {
		assistantId: kb?.assignedAssistantID ?? null,
		squadId: kb?.assignedSquadID ?? null,
		customVoiceId: rec?.customVoiceID ?? null,
		voicemailFile: rec?.voicemailFile ?? null,
		voices: Array.isArray(rec?.voices) ? (rec?.voices as AssistantVoice[]) : [],
		avatar: kb?.aiAvatar
			? {
					avatarKandidFile: kb.aiAvatar.avatarKandidFile,
					avatarMotionFile: kb.aiAvatar.avatarMotionFile,
					videoDetails: kb.aiAvatar.videoDetails,
				}
			: undefined,
		background: kb?.background
			? {
					backgroundVideoFile: kb.background.backgroundVideoFile,
					backgroundMusic: kb.background.backgroundMusic,
					colorScheme: kb.background.colorScheme,
				}
			: undefined,
	} satisfies Pick<
		AISettingsState,
		| "assistantId"
		| "squadId"
		| "customVoiceId"
		| "voicemailFile"
		| "voices"
		| "avatar"
		| "background"
	>;
}

const seeded = initialFromProfile(MockUserProfile ?? null);

export const useAISettingsStore = create<AISettingsState>((set) => ({
	assistantId: seeded.assistantId,
	squadId: seeded.squadId,
	customVoiceId: seeded.customVoiceId,
	voicemailFile: seeded.voicemailFile,
	voices: seeded.voices,
	avatar: seeded.avatar,
	background: seeded.background,

	setAssistantId: (assistantId) => set({ assistantId }),
	setSquadId: (squadId) => set({ squadId }),
	setCustomVoiceId: (customVoiceId) => set({ customVoiceId }),
	setVoicemailFile: (voicemailFile) => set({ voicemailFile }),
	setVoices: (voices) => set({ voices }),
	setAvatar: (avatar) => set({ avatar }),
	setBackground: (background) => set({ background }),

	hydrateFromProfile: (profile) => set(initialFromProfile(profile ?? null)),
	reset: () => set(initialFromProfile(null)),
}));
