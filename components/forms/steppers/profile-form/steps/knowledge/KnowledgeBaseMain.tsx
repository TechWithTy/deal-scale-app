import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";

import type {
	ElevenLabsClient,
	GenerateSpeechRequest,
} from "@/types/elevenLabs/api/clone";
import type React from "react";
import { useEffect, useState } from "react";
import type { InitialKnowledgeBaseData } from "../../../utils/const/getKnowledgeBase";

import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type { UseFormReturn } from "react-hook-form";
import { KnowledgeEmailUpload } from "./KnowledgeEmailUpload";
import { KnowledgeSalesScriptUpload } from "./KnowledgeSalesScriptUpload";
import { KnowledgeVoiceCloneModal } from "./KnowledgeVoiceCloneModal";
import { KnowledgeVoiceSelector } from "./KnowledgeVoiceSelector";
import { KnowledgeVoicemailModal } from "./KnowledgeVoicemailModal";

export interface KnowledgeBaseMainProps {
	form: UseFormReturn<ProfileFormValues>;
	loading: boolean;
	voices: AssistantVoice[];
	handleVoiceSelect: (voiceId: string) => void;
	handleScriptUpload: (scriptContent: string) => void;
	selectedScriptFileName: string;
	handleEmailUpload: (emailContent: string) => void;
	selectedEmailFileName: string;
	initialData?: InitialKnowledgeBaseData;
}

export const KnowledgeBaseMain: React.FC<KnowledgeBaseMainProps> = ({
	form,
	loading,
	voices,
	handleVoiceSelect,
	handleScriptUpload,
	selectedScriptFileName,
	handleEmailUpload,
	selectedEmailFileName,
	initialData,
}) => {
	const [showVoiceCloneModal, setShowVoiceCloneModal] = useState(false);
	const [showVoicemailModal, setShowVoicemailModal] = useState(false);

	useEffect(() => {
		if (initialData) {
			form.setValue("selectedVoice", initialData.selectedVoice || "");
			form.setValue("exampleSalesScript", initialData.exampleSalesScript || "");
			form.setValue("exampleEmailBody", initialData.exampleEmailBody || "");
			form.setValue(
				"voicemailRecordingId",
				initialData.voicemailRecordingId || "",
			);
			form.setValue("clonedVoiceId", initialData.clonedVoiceId || "");
		}
	}, [initialData, form]);

	const handleVoicemailRecording = (recordingId: string) => {
		form.setValue("voicemailRecordingId", recordingId);
		setShowVoicemailModal(false);
	};

	const handleVoiceCloneRecording = (recordingId: string) => {
		form.setValue("clonedVoiceId", recordingId);
		setShowVoiceCloneModal(false);
	};

	return (
		<>
			<KnowledgeVoiceSelector
				form={form}
				loading={loading}
				voices={voices}
				handleVoiceSelect={handleVoiceSelect}
			/>
			<KnowledgeSalesScriptUpload
				loading={loading}
				handleScriptUpload={handleScriptUpload}
				selectedScriptFileName={selectedScriptFileName}
			/>
			<KnowledgeEmailUpload
				loading={loading}
				handleEmailUpload={handleEmailUpload}
				selectedEmailFileName={selectedEmailFileName}
			/>
			<KnowledgeVoicemailModal
				open={showVoicemailModal}
				onClose={() => setShowVoicemailModal(false)}
				onSave={handleVoicemailRecording}
			/>
			<KnowledgeVoiceCloneModal
				open={showVoiceCloneModal}
				onClose={() => setShowVoiceCloneModal(false)}
				onSave={handleVoiceCloneRecording}
			/>
		</>
	);
};
