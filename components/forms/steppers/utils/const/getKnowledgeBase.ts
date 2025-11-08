import type { UserProfile } from "@/types/userProfile";

export interface InitialKnowledgeBaseData {
	selectedVoice?: string;
	exampleSalesScript?: string;
	exampleEmailBody?: string;
	voicemailRecordingId?: string;
	clonedVoiceId?: string;
	approvalLevel?: "manual" | "auto" | "turbo";
	mcpAllowList?: {
		tools: string[];
		words: string[];
		phrases: string[];
		regexes: string[];
	};
	mcpDenyList?: {
		tools: string[];
		words: string[];
		phrases: string[];
		regexes: string[];
	};
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
		approvalLevel: profile.aIKnowledgebase?.approvalLevel || "manual",
		mcpAllowList: {
			tools: profile.aIKnowledgebase?.mcpAllowList?.tools ?? [],
			words: profile.aIKnowledgebase?.mcpAllowList?.words ?? [],
			phrases: profile.aIKnowledgebase?.mcpAllowList?.phrases ?? [],
			regexes: profile.aIKnowledgebase?.mcpAllowList?.regexes ?? [],
		},
		mcpDenyList: {
			tools: profile.aIKnowledgebase?.mcpDenyList?.tools ?? [],
			words: profile.aIKnowledgebase?.mcpDenyList?.words ?? [],
			phrases: profile.aIKnowledgebase?.mcpDenyList?.phrases ?? [],
			regexes: profile.aIKnowledgebase?.mcpDenyList?.regexes ?? [],
		},
	};
};
