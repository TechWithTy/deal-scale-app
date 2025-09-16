import type React from "react";

interface KnowledgeVoiceCloneModalProps {
	open: boolean;
	onClose: () => void;
	onSave: (recordingId: string) => void;
}

export const KnowledgeVoiceCloneModal: React.FC<
	KnowledgeVoiceCloneModalProps
> = ({ open, onClose, onSave }) => {
	if (!open) return null;
	// Placeholder for actual modal logic/recording UI
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-sm">
			<div className="rounded bg-card p-8 shadow-lg">
				<h2 className="mb-4 font-bold text-lg">Record Voice Clone</h2>
				{/* TODO: Add actual audio recording UI */}
				<button
					type="button"
					className="mr-2 rounded bg-primary px-4 py-2 text-primary-foreground"
					onClick={() => onSave("mock-voice-clone-id")}
				>
					Save
				</button>
				<button
					type="button"
					className="rounded bg-muted px-4 py-2 text-muted-foreground"
					onClick={onClose}
				>
					Cancel
				</button>
			</div>
		</div>
	);
};
