import type React from "react";
import VoiceRecorderCore from "./VoiceRecorderCore";
import {
	type VoiceCreationPreferences,
	VoicePreferencesForm,
} from "./VoicePreferencesForm";

interface VoicemailModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (audioBlob: Blob) => void;
	preferences: VoiceCreationPreferences;
	onPreferencesChange: (prefs: VoiceCreationPreferences) => void;
}

const MIN_RECORDING_LENGTH = 5;
const MAX_RECORDING_LENGTH = 120;

const VoicemailModal: React.FC<VoicemailModalProps> = ({
	open,
	onClose,
	onSave,
	preferences,
	onPreferencesChange,
}) => {
	return (
		<VoiceRecorderCore
			open={open}
			onClose={onClose}
			onSave={onSave}
			minRecordingLength={MIN_RECORDING_LENGTH}
			maxRecordingLength={MAX_RECORDING_LENGTH}
			modalTitle={"Record Voicemail"}
			extraContent={
				<div className="mb-4 space-y-4 text-center">
					<div className="font-medium text-blue-600 text-xs dark:text-blue-300">
						We recommend a recording length of{" "}
						<span className="font-bold">20-30 seconds</span>. Keep it short and
						focused, highlighting a key benefit and making it easy for the
						prospect to take action by calling you back.{" "}
						<span className="font-bold">Focus on quality!</span>
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

export default VoicemailModal;
