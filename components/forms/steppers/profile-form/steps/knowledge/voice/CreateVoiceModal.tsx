import type React from "react";
import { useState } from "react";

interface CreateVoiceModalProps {
	open: boolean;
	onClose: () => void;
	minLength?: number;
	maxLength?: number;
	onSave: (audioBlob: Blob) => Promise<void>;
}

/**
 * Modal for creating a new voice prompt with guidelines.
 * - Enforces min/max length
 * - Shows prompt guidelines for best results
 */
const CreateVoiceModal: React.FC<CreateVoiceModalProps> = ({
	open,
	onClose,
	minLength = 20,
	maxLength = 200,
	onSave,
}) => {
	const [prompt, setPrompt] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (prompt.length < minLength) {
			setError(`Prompt must be at least ${minLength} characters.`);
			return;
		}
		if (prompt.length > maxLength) {
			setError(`Prompt must be at most ${maxLength} characters.`);
			return;
		}
		setError("");
		setPrompt("");
		onClose();
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="relative w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
				<button
					type="button"
					className="absolute top-2 right-2 text-muted-foreground hover:text-foreground focus:outline-none"
					onClick={onClose}
					aria-label="Close"
				>
					×
				</button>
				<h2 className="mb-2 font-bold text-lg">Create a New Voice Prompt</h2>
				<div className="mb-4 text-muted-foreground text-sm">
					<strong>Guidelines for best results:</strong>
					<ul className="mt-2 list-disc pl-5">
						Create an original, realistic voice by specifying age,
						accent/nationality, gender, tone, pitch, intonation, speed, and
						emotion.
						<li className="mt-2">
							<a
								href="https://elevenlabs.io/docs/product-guides/voices/voice-design"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								Read full documentation
							</a>
						</li>
					</ul>
				</div>
				<form onSubmit={handleSubmit}>
					<textarea
						className="mt-1 w-full rounded border border-input bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						rows={4}
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						minLength={minLength}
						maxLength={maxLength}
						placeholder="Describe your ideal voice..."
						required
						aria-label="Voice prompt"
					/>
					{error && (
						<div className="mt-2 text-destructive text-sm">{error}</div>
					)}
					<div className="mt-4 flex justify-end">
						<button
							type="button"
							className="mr-2 rounded bg-muted px-4 py-2 text-muted-foreground hover:bg-muted/80"
							onClick={onClose}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
							disabled={prompt.length < minLength || prompt.length > maxLength}
						>
							Create Voice
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateVoiceModal;
