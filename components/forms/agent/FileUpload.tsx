import type React from "react";
import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

export type FileItem = {
	id: string;
	file: File;
};

interface FileUploadProps {
	value: FileItem[];
	onChange: (files: FileItem[]) => void;
	error?: string;
	label: string;
	accept?: string;
	maxFiles?: number;
}

function truncateMiddle(str: string, maxLength = 18) {
	if (str.length <= maxLength) return str;
	const keep = Math.floor((maxLength - 3) / 2);
	return `${str.slice(0, keep)}...${str.slice(-keep)}`;
}

export const FileUpload: React.FC<FileUploadProps> = ({
	value = [],
	onChange,
	error,
	label,
	accept = "*",
	maxFiles = 1,
}) => {
	const { trigger } = useFormContext();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFiles = (files: FileList | null) => {
		if (!files) return;
		const newItems: FileItem[] = Array.from(files).map((file) => ({
			id: uuidv4(),
			file,
		}));
		const updatedFiles = [...value, ...newItems].slice(0, maxFiles);
		onChange(updatedFiles);
		trigger("directMailTemplates");
	};

	const handleRemove = (id: string) => {
		const newFiles = value.filter((item) => item.id !== id);
		onChange(newFiles);
		trigger("directMailTemplates");
	};

	return (
		<div>
			<label htmlFor="file-upload" className="mb-2 block font-semibold">
				{label}
			</label>
			<button
				type="button"
				className="mb-2 flex flex-col items-center rounded-md border border-dashed bg-muted/50 p-4"
				onClick={() => inputRef.current?.click()}
				aria-label={`Upload ${label}`}
			>
				<input
					id="file-upload"
					ref={inputRef}
					type="file"
					accept={accept}
					multiple={maxFiles > 1}
					className="hidden"
					onChange={(e) => handleFiles(e.target.files)}
				/>
				<span className="text-muted-foreground">
					Drag & drop or click to upload
				</span>
			</button>
			<div className="mb-2 grid grid-cols-2 items-start gap-4 md:grid-cols-4">
				{value.map((item) => (
					<div
						key={item.id}
						className="relative mr-4 mb-4 inline-block h-24 w-24 rounded border border-border bg-card p-2 text-center"
					>
						<p className="text-xs">{truncateMiddle(item.file.name)}</p>
						<button
							type="button"
							className="absolute top-1 right-1 z-10 rounded-full bg-card p-1 text-destructive hover:bg-card/80"
							onClick={() => handleRemove(item.id)}
							aria-label="Remove file"
						>
							&times;
						</button>
					</div>
				))}
			</div>
			<div className="mb-1 text-muted-foreground text-xs">
				{value.length}/{maxFiles} files selected
			</div>
			{error && <p className="text-destructive text-xs">{error}</p>}
		</div>
	);
};
