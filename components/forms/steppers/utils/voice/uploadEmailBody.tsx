import { marked } from "marked"; // Ensure this is the latest version that returns a Promise
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

interface UploadEmailBodyProps {
	onFileUpload: (fileContent: string) => void; // Callback to pass file content to parent
	selectedFileName?: string; // Optionally pass the file name from the parent
}

export const UploadEmailBody: React.FC<UploadEmailBodyProps> = ({
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
						const html = await marked.parse(text); // Await here to handle the Promise
						setFileContent(html); // Store the converted HTML content
						onFileUpload(html); // Pass the content to the parent via callback
					} catch (error) {
						console.error("Error parsing markdown:", error);
						setFileContent("Error parsing markdown.");
					}
				} else {
					setFileContent(text); // If HTML, store it directly
					onFileUpload(text); // Pass the HTML content to the parent
				}
			};
			reader.readAsText(file); // Read the file content
		}
	};

	return (
		<div className="mx-auto mt-4 max-w-3xl overflow-auto rounded-lg border border-gray-300 bg-white p-4 text-gray-900 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
			<label
				htmlFor="email-body-upload"
				className="block font-medium text-gray-700 text-sm dark:text-gray-300"
			>
				Upload Email Body Content (.md, .html)
			</label>
			<input
				type="file"
				accept=".md,.html"
				onChange={handleFileUpload}
				className="mt-2 block w-full text-gray-500 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-sm file:text-white hover:file:bg-blue-700 dark:text-gray-300 file:dark:bg-blue-500 dark:hover:file:bg-blue-600"
			/>
			{fileName && (
				<p className="mt-2 text-gray-600 text-sm dark:text-gray-400">
					Uploaded file: {fileName}
				</p>
			)}

			{fileContent && (
				<div
					className="prose dark:prose-dark mt-4 max-w-none rounded-lg border bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-800"
					dangerouslySetInnerHTML={{ __html: fileContent }}
				/>
			)}
		</div>
	);
};
