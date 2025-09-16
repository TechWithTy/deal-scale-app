import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

interface UploadSalesScriptProps {
	onFileUpload: (fileContent: string) => void; // Callback to pass the file content to the parent
	selectedFileName?: string; // Optionally pass the file name from the parent
}

const UploadSalesScript: React.FC<UploadSalesScriptProps> = ({
	onFileUpload,
	selectedFileName,
}) => {
	const [fileName, setFileName] = useState<string | null>(
		selectedFileName || null,
	); // Store file name
	const [fileContent, setFileContent] = useState<string | null>(null); // Store parsed content

	// Function to handle file uploads
	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const fileType = file.name.split(".").pop()?.toLowerCase();
			if (!["txt", "doc", "docx"].includes(fileType || "")) {
				toast("Only .txt, .doc, or .docx files are allowed.");
				return;
			}

			setFileName(file.name); // Set the uploaded file's name

			const reader = new FileReader();
			reader.onload = (event) => {
				const text = event.target?.result as string;

				// Handle the file content
				setFileContent(text); // Store the file content directly
				onFileUpload(text); // Pass the content to the parent component
			};
			reader.readAsText(file); // Read the file content
		}
	};

	return (
		<div className="mx-auto mt-4 max-w-3xl overflow-auto rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg">
			<label
				htmlFor="script-upload"
				className="block text-sm font-medium text-foreground"
			>
				Upload Script (.txt, .doc, .docx)
			</label>
			<input
				id="script-upload"
				type="file"
				accept=".txt,.doc,.docx"
				onChange={handleFileUpload}
				className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
			/>

			{/* Display selected file name and script content */}
			{fileName && (
				<p className="mt-2 text-sm text-muted-foreground">
					Uploaded file: {fileName}
				</p>
			)}
			{fileContent && (
				<pre className="mt-4 max-h-40 overflow-auto rounded-lg border border-border bg-muted p-4 text-sm">
					{fileContent}
				</pre>
			)}
		</div>
	);
};

export default UploadSalesScript;
