"use client";

import { FormProvider } from "react-hook-form";

import type { Agent } from "./utils/schema";
import { useAgentForm } from "./useAgentForm";

import { AgentDetailsForm } from "./AgentDetailsForm";
import { AgentAudioForm } from "./AgentAudioForm";

import { AgentPublicationForm } from "./AgentPublicationForm";
import { AgentSocialForm } from "./AgentSocialForm";
import { AgentDirectMailForm } from "./AgentDirectMailForm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VoicemailModal from "@/components/forms/steppers/profile-form/steps/knowledge/voice/VoicemailModal";
import { CloneModal } from "external/teleprompter-modal";

interface AgentFormProps {
	onSubmit: (data: Agent) => void;
	onCancel: () => void;
	defaultValues?: Partial<Agent>;
	isEditing?: boolean;
}

export function AgentForm({
	onSubmit,
	onCancel,
	defaultValues,
	isEditing = false,
}: AgentFormProps) {
	const {
		form,
		showVoicemailModal,
		setShowVoicemailModal,
		showCloneModal,
		setShowCloneModal,
		imagePreview,
		handleImageChange,
		voices,
		voicemails,
		backgroundNoises,
		handleVoicemailAudio,
		handleCloneVoiceAudio,
		avatars,
	} = useAgentForm(defaultValues);

	const agentType = form.watch("type");

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>
						{isEditing ? "Edit AI Agent" : "Create AI Agent"}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<FormProvider {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<AgentDetailsForm
								form={form}
								imagePreview={imagePreview}
								handleImageChange={handleImageChange}
							/>
							<AgentPublicationForm form={form} />

							{agentType === "phone" && (
								<AgentAudioForm
									form={form}
									voices={voices}
									voicemails={voicemails}
									backgroundNoises={backgroundNoises}
									onShowCloneModal={() => setShowCloneModal(true)}
									onShowVoicemailModal={() => setShowVoicemailModal(true)}
								/>
							)}

							{agentType === "social" && (
								<AgentSocialForm form={form} avatars={avatars} />
							)}

							{agentType === "direct mail" && (
								<AgentDirectMailForm form={form} />
							)}

							<div className="flex justify-end space-x-2">
								<Button type="button" variant="outline" onClick={onCancel}>
									Cancel
								</Button>
								<Button type="submit">
									{isEditing ? "Update Agent" : "Save Agent"}
								</Button>
							</div>
						</form>
					</FormProvider>
				</CardContent>
			</Card>
			<VoicemailModal
				open={showVoicemailModal}
				onClose={() => setShowVoicemailModal(false)}
				onSave={handleVoicemailAudio}
			/>
			<CloneModal
				open={showCloneModal}
				onClose={() => setShowCloneModal(false)}
				onSave={handleCloneVoiceAudio}
			/>
		</>
	);
}
