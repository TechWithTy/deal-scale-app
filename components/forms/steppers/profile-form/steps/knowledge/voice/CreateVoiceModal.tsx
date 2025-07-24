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
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
			<div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
				<button
					type="button"
					className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
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
								className="text-blue-600 hover:underline dark:text-blue-400"
							>
								Read full documentation
							</a>
						</li>
					</ul>
				</div>
				<form onSubmit={handleSubmit}>
					<textarea
						className="mt-1 w-full rounded border px-3 py-2 text-base focus:ring focus:ring-blue-300 dark:bg-gray-800 dark:text-white"
						rows={4}
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						minLength={minLength}
						maxLength={maxLength}
						placeholder="Describe your ideal voice..."
						required
						aria-label="Voice prompt"
					/>
					{error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
					<div className="mt-4 flex justify-end">
						<button
							type="button"
							className="mr-2 rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
							onClick={onClose}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
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
