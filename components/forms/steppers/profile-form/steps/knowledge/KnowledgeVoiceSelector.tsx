import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import type { AssistantVoice } from "@/types/vapiAi/api/assistant/create";
import { useFormContext } from "react-hook-form";
import type React from "react";
import type { ProfileFormValues } from "@/types/zod/userSetup/profile-form-schema";
import {
	AudioDropdown,
	type AudioDropdownOption,
} from "@/components/ui/AudioDropdown";

import { mockUserProfile } from "@/constants/_faker/profile/userProfile";

interface KnowledgeVoiceSelectorProps {
	loading: boolean;
}

export const KnowledgeVoiceSelector: React.FC<KnowledgeVoiceSelectorProps> = ({
	loading,
}) => {
	// Fetch voices directly from mockUserProfile
	const voices = mockUserProfile?.aIKnowledgebase?.recordings?.voices ?? [];
	const { control } = useFormContext<ProfileFormValues>();
	console.log("DEBUG KnowledgeVoiceSelector voices", voices);
	const audioOptions: AudioDropdownOption[] = [
		{ label: "Choose a voice...", value: "" },
		...voices.map((voice) => ({
			label: voice.name || voice.voiceId,
			value: voice.voiceId,
			audioUrl: voice.audioUrl, // Use audioUrl directly from mock data
		})),
	];
	console.log("DEBUG KnowledgeVoiceSelector audioOptions", audioOptions);

	return (
		<FormField
			control={control}
			name="selectedVoice"
			render={({ field }) => (
				<FormItem>
					<FormLabel>
						Select Voice (Optional): Personalize your agent's voice
					</FormLabel>
					<FormControl>
						<AudioDropdown
							disabled={loading}
							value={field.value ?? ""}
							onChange={(val: string) => {
								field.onChange(val);
							}}
							options={audioOptions}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
