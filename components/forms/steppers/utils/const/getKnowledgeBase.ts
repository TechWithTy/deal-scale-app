import type { UserProfile } from "@/types/userProfile";

export interface InitialKnowledgeBaseData {
	selectedVoice?: string;
	exampleSalesScript?: string;
	exampleEmailBody?: string;
	voicemailRecordingId?: string;
	clonedVoiceId?: string;
}

export const extractInitialKnowledgeBaseDataFromUserProfile = (
	profile: UserProfile,
): InitialKnowledgeBaseData => {
	return {
		selectedVoice: profile.aIKnowledgebase?.assignedAssistantID || "",
		exampleSalesScript: profile.aIKnowledgebase?.salesScript || "",
		exampleEmailBody: profile.aIKnowledgebase?.emailTemplate || "",
		voicemailRecordingId:
			profile.aIKnowledgebase?.recordings?.voicemailFile || "",
		clonedVoiceId:
			profile.aIKnowledgebase?.recordings?.voiceClone?.clonedVoiceID || "",
	};
};
