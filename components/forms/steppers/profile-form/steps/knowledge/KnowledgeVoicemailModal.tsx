import type React from "react";

interface KnowledgeVoicemailModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (recordingId: string) => void;
}

export const KnowledgeVoicemailModal: React.FC<
	KnowledgeVoicemailModalProps
> = ({ open, onClose, onSave }) => {
	if (!open) return null;
	// Placeholder for actual modal logic/recording UI
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
			<div className="rounded bg-white p-8 shadow-lg">
				<h2 className="mb-4 font-bold text-lg">Record Voicemail</h2>
				{/* TODO: Add actual audio recording UI */}
				<button
					type="button"
					className="mr-2 rounded bg-blue-600 px-4 py-2 text-white"
					onClick={() => onSave("mock-voicemail-id")}
				>
					Save
				</button>
				<button
					type="button"
					className="rounded bg-gray-400 px-4 py-2 text-white"
					onClick={onClose}
				>
					Cancel
				</button>
			</div>
		</div>
	);
};
