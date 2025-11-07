import { scriptCloneTextDefault } from "@/constants/_faker/_api/eleven_labs/scripts";
import type React from "react";
import VoiceRecorderCore from "./VoiceRecorderCore";
import {
	type VoiceCreationPreferences,
	VoicePreferencesForm,
} from "./VoicePreferencesForm";

const MIN_RECORDING_LENGTH = 60;
const MAX_RECORDING_LENGTH = 120;

interface CloneModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (audioBlob: Blob) => void;
	preferences: VoiceCreationPreferences;
	onPreferencesChange: (prefs: VoiceCreationPreferences) => void;
}

const CloneModal: React.FC<CloneModalProps> = ({
	open,
	onClose,
	onSave,
	preferences,
	onPreferencesChange,
}) => {
	if (!open) return null;

	return (
		<VoiceRecorderCore
			open={open}
			onClose={onClose}
			onSave={onSave}
			minRecordingLength={MIN_RECORDING_LENGTH}
			maxRecordingLength={MAX_RECORDING_LENGTH}
			scriptText={scriptCloneTextDefault}
			showTeleprompter={true}
			modalTitle={"Clone Your Voice"}
			extraContent={
				<div className="mb-4 space-y-4 text-muted-foreground text-sm">
					<div>
						<strong>Guidelines for best results:</strong>
						<ul className="mt-2 list-disc pl-5">
							Approximately 1-2 minutes of clear audio without any reverb,
							artifacts, or background noise of any kind is recommended. When we
							speak of “audio or recording quality,” we do not mean the codec,
							such as MP3 or WAV; we mean how the audio was captured
							<li className="mt-2">
								<a
									href="https://elevenlabs.io/docs/product-guides/voices/voice-cloning/instant-voice-cloning#record-at-least-1-minute-of-audio"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline dark:text-blue-400"
								>
									Read full documentation
								</a>
							</li>
						</ul>
					</div>
					<VoicePreferencesForm
						preferences={preferences}
						onChange={onPreferencesChange}
					/>
				</div>
			}
		/>
	);
};

export default CloneModal;
