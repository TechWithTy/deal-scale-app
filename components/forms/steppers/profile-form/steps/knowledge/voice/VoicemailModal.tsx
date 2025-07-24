import type React from "react";
import VoiceRecorderCore from "./VoiceRecorderCore";

interface VoicemailModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (audioBlob: Blob) => void;
}

const MIN_RECORDING_LENGTH = 5;
const MAX_RECORDING_LENGTH = 120;

const VoicemailModal: React.FC<VoicemailModalProps> = ({
	open,
	onClose,
	onSave,
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
				<div className="mb-4 text-center font-medium text-blue-600 text-xs dark:text-blue-300">
					We recommend a recording length of{" "}
					<span className="font-bold">20-30 seconds</span>.<br />
					Keep it short and focused, highlighting a key benefit and making it
					easy for the prospect to take action by calling you back.
					<br />
					<span className="font-bold">Focus on quality!</span>
				</div>
			}
		/>
	);
};

export default VoicemailModal;
