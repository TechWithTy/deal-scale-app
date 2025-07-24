import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";

import type {
	ElevenLabsClient,
	GenerateSpeechRequest,
} from "@/types/elevenLabs/api/clone";
import type React from "react";
import { useEffect, useState, useRef } from "react";

import type { InitialKnowledgeBaseData } from "../../../utils/const/getKnowledgeBase";

import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import type { UseFormReturn } from "react-hook-form";
import { KnowledgeEmailUpload } from "./KnowledgeEmailUpload";
import { KnowledgeSalesScriptUpload } from "./KnowledgeSalesScriptUpload";

import VoicemailModal from "./voice/VoicemailModal";
import VoiceFeatureTabs from "./voice/utils/VoiceFeatureTabs";
import CreateVoiceModal from "./voice/CreateVoiceModal";

import { useFormContext } from "react-hook-form";
import { KnowledgeVoiceSelector } from "./KnowledgeVoiceSelector";
import CloneModal from "./voice/CloneModal";
import { FormLabel } from "@/components/ui/form";
import type { PlayButtonTimeLineHandle } from "@/components/reusables/audio/timeline/types";

export interface KnowledgeBaseMainProps {
	loading: boolean;
	handleVoiceSelect: (voiceId: string) => void;
	handleScriptUpload: (scriptContent: string) => void;
	selectedScriptFileName: string;
	handleEmailUpload: (emailContent: string) => void;
	selectedEmailFileName: string;
	initialData?: InitialKnowledgeBaseData;
}

export const KnowledgeBaseMain: React.FC<KnowledgeBaseMainProps> = ({
	loading,
	handleVoiceSelect,
	handleScriptUpload,
	selectedScriptFileName,
	handleEmailUpload,
	selectedEmailFileName,
	initialData,
}) => {
	const form = useFormContext<ProfileFormValues>();
	const [showVoiceCloneModal, setShowVoiceCloneModal] = useState(false);
	const [showVoicemailModal, setShowVoicemailModal] = useState(false);
	const [showCreateVoiceModal, setShowCreateVoiceModal] = useState(false);
	const createVoiceTimelineRef = useRef<PlayButtonTimeLineHandle>(null);

	useEffect(() => {
		if (initialData) {
			form.setValue("selectedVoice", initialData.selectedVoice || "");
			form.setValue("exampleSalesScript", initialData.exampleSalesScript || "");
			// form.setValue("exampleEmailBody", initialData.exampleEmailBody || "");
			form.setValue(
				"voicemailRecordingId",
				initialData.voicemailRecordingId || "",
			);
			form.setValue("clonedVoiceId", initialData.clonedVoiceId || "");
		}
	}, [initialData, form]);

	const handleVoicemailAudio = async (audioBlob: Blob) => {
		// Simulate upload and generate a fake ID for testing
		console.log("Received audio blob for voicemail:", audioBlob);
		const fakeRecordingId = `test-voicemail-${Date.now()}`;
		form.setValue("voicemailRecordingId", fakeRecordingId);
		setShowVoicemailModal(false);
	};
	const handleVoiceCloneAudio = async (audioBlob: Blob) => {
		// Simulate upload and generate a fake ID for testing
		console.log("Received audio blob for voicemail:", audioBlob);
		const fakeRecordingId = `test-voicemail-${Date.now()}`;
		form.setValue("clonedVoiceId", fakeRecordingId);
		setShowVoiceCloneModal(false);
	};

	const handleCreatedVoiceAudio = async (audioBlob: Blob) => {
		// Simulate upload and generate a fake ID for testing
		console.log("Received audio blob for voicemail:", audioBlob);
		const fakeRecordingId = `test-voicemail-${Date.now()}`;
		form.setValue("createdVoiceId", fakeRecordingId);
		setShowVoicemailModal(false);
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
			{/* Voice Features Group */}
			<div className="flex flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
				<span className="mb-2 font-semibold text-lg">Voice Features</span>
				<KnowledgeVoiceSelector loading={loading} />
				<VoiceFeatureTabs
					tabs={[
						{
							label: "Record Voicemail",
							content: (
								<button
									type="button"
									className="w-56 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
									onClick={() => setShowVoicemailModal(true)}
									aria-label="Record Voicemail"
								>
									+ Record Voicemail
								</button>
							),
						},
						{
							label: "Clone Voice",
							content: (
								<button
									type="button"
									className="w-56 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:bg-purple-500 dark:hover:bg-purple-600"
									onClick={() => setShowVoiceCloneModal(true)}
									aria-label="Clone Voice"
								>
									+ Clone Voice
								</button>
							),
						},
						{
							label: "Create Voice",
							audioSrc:
								"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
							timelineRef: createVoiceTimelineRef,
							content: (
								<button
									type="button"
									className="w-56 rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white shadow hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 dark:bg-yellow-500 dark:hover:bg-yellow-600"
									onClick={() => setShowCreateVoiceModal(true)}
									aria-label="Create Voice"
								>
									+ Create Voice
								</button>
							),
						},
					]}
					className="w-full"
				/>
				<VoicemailModal
					open={showVoicemailModal}
					onClose={() => setShowVoicemailModal(false)}
					onSave={handleVoicemailAudio}
				/>
				<CloneModal
					open={showVoiceCloneModal}
					onClose={() => setShowVoiceCloneModal(false)}
					onSave={handleVoiceCloneAudio}
				/>
				<CreateVoiceModal
					open={showCreateVoiceModal}
					onClose={() => setShowCreateVoiceModal(false)}
					onSave={handleCreatedVoiceAudio}
				/>
			</div>

			{/* Script & Email Features Group */}
			<div className="flex flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
				<span className="mb-2 font-semibold text-lg">Sales Script</span>
				<FormLabel>
					Select Voice (Optional): Personalize your agent's voice{" "}
				</FormLabel>

				<KnowledgeSalesScriptUpload
					loading={loading}
					handleScriptUpload={handleScriptUpload}
					selectedScriptFileName={selectedScriptFileName}
				/>
				{/* <div className="relative flex w-full flex-col items-center justify-center gap-2">
					<label
						htmlFor="exampleEmailBody"
						className="mb-1 font-medium text-base text-gray-700 dark:text-gray-200"
					>
						Upload Email Body Content
					</label>
					<KnowledgeEmailUpload
						loading={loading}
						handleEmailUpload={handleEmailUpload}
						selectedEmailFileName={selectedEmailFileName}
						disabled={true} // ! Feature flag for coming soon
					/>
					
				</div> */}
			</div>

			{/* Modals */}
			{showVoiceCloneModal && (
				<VoicemailModal
					open={showVoicemailModal}
					onClose={() => setShowVoicemailModal(false)}
					onSave={(audioBlob) => {
						// todo: handle upload or save logic
						setShowVoicemailModal(false);
					}}
				/>
			)}
			{showVoiceCloneModal && (
				<CloneModal
					open={showVoiceCloneModal}
					onClose={() => setShowVoiceCloneModal(false)}
					onSave={(audioBlob) => {
						// todo: handle upload or save logic
						setShowVoiceCloneModal(false);
					}}
				/>
			)}
		</div>
	);
};
