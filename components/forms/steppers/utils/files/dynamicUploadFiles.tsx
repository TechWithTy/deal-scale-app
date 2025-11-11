import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

interface DynamicFileUploadProps {
	onFilesUpload: (uploadedFiles: File[]) => void; // Callback to pass the uploaded files to the parent
	allowedFileTypes: string[]; // List of allowed file extensions (e.g., ['jpg', 'png', 'webp'])
	minFiles: number; // Minimum number of files to upload
	maxFiles: number; // Maximum number of files to upload
	selectedFiles?: File[]; // Optionally pass the already selected files
}

export const DynamicFileUpload: React.FC<DynamicFileUploadProps> = ({
	onFilesUpload,
	allowedFileTypes,
	minFiles,
	maxFiles,
	selectedFiles = [],
}) => {
	const [files, setFiles] = useState<File[]>(selectedFiles); // Store the uploaded files

	// Function to handle file uploads
	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || []);

		// Check if total files exceed the max limit
		if (selectedFiles.length + files.length > maxFiles) {
			toast(`You can upload a maximum of ${maxFiles} files.`);
			return;
		}

		// Validate file types
		const validFiles = selectedFiles.filter((file) => {
			const fileType = file.name.split(".").pop()?.toLowerCase();
			if (!allowedFileTypes.includes(fileType || "")) {
				toast(`Only ${allowedFileTypes.join(", ")} files are allowed.`);
				return false;
			}
			return true;
		});

		// Update the file state with valid files
		const newFiles = [...files, ...validFiles];

		// Ensure the number of files is between minFiles and maxFiles
		if (newFiles.length < minFiles) {
			toast(`You must upload at least ${minFiles} files.`);
			return;
		}

		// Update the state and pass the files to the parent component
		setFiles(newFiles);
		onFilesUpload(newFiles); // Pass the File objects directly
	};

	return (
		<div className="mx-auto mt-4 max-w-3xl overflow-auto rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg">
			<label
				htmlFor="dynamic-file-upload"
				className="block font-medium text-foreground text-sm"
			>
				Upload Files ({minFiles} to {maxFiles} allowed,{" "}
				{allowedFileTypes.join(", ")})
			</label>
			<input
				id="dynamic-file-upload"
				type="file"
				accept={allowedFileTypes.map((type) => `.${type}`).join(",")}
				multiple
				onChange={handleFileUpload}
				className="mt-2 block w-full text-muted-foreground text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-primary-foreground file:text-sm hover:file:bg-primary/90"
			/>
			{files.length > 0 && (
				<p className="mt-2 text-muted-foreground text-sm">
					Uploaded files: {files.map((file) => file.name).join(", ")}
				</p>
			)}
		</div>
	);
};
