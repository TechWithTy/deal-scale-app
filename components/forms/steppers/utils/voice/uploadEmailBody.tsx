import { marked } from "marked"; // Ensure this is the latest version that returns a Promise
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
// ! SECURITY: Install DOMPurify for HTML sanitization: pnpm add dompurify
import DOMPurify from "dompurify";

interface UploadEmailBodyProps {
	onFileUpload: (fileContent: string) => void; // Callback to pass file content to parent
	selectedFileName?: string; // Optionally pass the file name from the parent
	disabled?: boolean; // ! Disable upload and interaction, show overlay
}

export const UploadEmailBody: React.FC<UploadEmailBodyProps> = ({
	onFileUpload,
	selectedFileName,
	disabled = false,
}) => {
	const [fileName, setFileName] = useState<string | null>(
		selectedFileName || null,
	); // Store file name
	const [fileContent, setFileContent] = useState<string | null>(null); // Store parsed content

	// * Sanitize HTML using DOMPurify (returns string)
	const sanitizeHtml = (dirty: string): string => {
		return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
	};

	// Function to handle file uploads
	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const fileType = file.name.split(".").pop()?.toLowerCase();
			if (!["md", "html"].includes(fileType || "")) {
				toast("Only .md (Markdown) and .html (HTML) files are allowed.");
				return;
			}

			setFileName(file.name); // Set the uploaded file's name

			const reader = new FileReader();
			reader.onload = async (event) => {
				const text = event.target?.result as string;

				// If markdown, convert to HTML using async/await
				if (fileType === "md") {
					try {
						const html = await marked.parse(text);
						const sanitized = sanitizeHtml(html); // ! Sanitize markdown output
						setFileContent(sanitized);
						onFileUpload(sanitized);
					} catch (error) {
						console.error("Error parsing markdown:", error);
						setFileContent("Error parsing markdown.");
					}
				} else {
					const sanitized = sanitizeHtml(text); // ! Sanitize HTML file
					setFileContent(sanitized);
					onFileUpload(sanitized);
				}
			};
			reader.readAsText(file); // Read the file content
		}
	};

	return (
		<div className="relative mx-auto mt-4 max-w-3xl overflow-auto rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg">
			{/* ! Overlay when disabled */}
			{disabled && (
				<div className="absolute inset-0 z-20 flex cursor-not-allowed items-center justify-center rounded-lg bg-muted/80">
					<span className="text-lg font-semibold text-muted-foreground">
						Coming soon
					</span>
				</div>
			)}
			<label
				htmlFor="email-body-upload"
				className="block text-sm font-medium text-foreground"
			>
				Upload Email Body Content (.md, .html)
			</label>
			<input
				id="email-body-upload"
				type="file"
				accept=".md,.html"
				onChange={handleFileUpload}
				disabled={disabled}
				aria-disabled={disabled}
				className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
			/>
			{fileName && (
				<p className="mt-2 text-sm text-muted-foreground">
					Uploaded file: {fileName}
				</p>
			)}

			{fileContent && (
				<div
					className="prose dark:prose-dark mt-4 max-w-none rounded-lg border border-border bg-muted p-4"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{ __html: fileContent }}
				/>
			)}
		</div>
	);
};
