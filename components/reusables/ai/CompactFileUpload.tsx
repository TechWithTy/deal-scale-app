/**
 * Compact File Upload for AI Context
 * Space-efficient drag-and-drop file upload with chip display
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { File, Paperclip, X, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/_utils";

interface FileAttachment {
	id: string;
	file: File;
	name: string;
	size: number;
	type: string;
}

interface CompactFileUploadProps {
	files: FileAttachment[];
	onChange: (files: FileAttachment[]) => void;
	maxFiles?: number;
	maxSizeMB?: number;
	acceptedTypes?: string[];
	className?: string;
}

export function CompactFileUpload({
	files,
	onChange,
	maxFiles = 5,
	maxSizeMB = 10,
	acceptedTypes = [".pdf", ".doc", ".docx", ".txt", ".csv", ".xlsx"],
	className = "",
}: CompactFileUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const formatFileSize = (bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	const validateAndAddFiles = useCallback(
		(fileList: FileList | null) => {
			if (!fileList) return;

			const newFiles: FileAttachment[] = [];
			const errors: string[] = [];

			Array.from(fileList).forEach((file) => {
				// Check file count
				if (files.length + newFiles.length >= maxFiles) {
					errors.push(`Maximum ${maxFiles} files allowed`);
					return;
				}

				// Check file size
				const sizeMB = file.size / (1024 * 1024);
				if (sizeMB > maxSizeMB) {
					errors.push(`${file.name} exceeds ${maxSizeMB}MB limit`);
					return;
				}

				// Check file type
				const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
				if (!acceptedTypes.includes(ext)) {
					errors.push(`${file.name} type not supported`);
					return;
				}

				newFiles.push({
					id: `${file.name}-${Date.now()}-${Math.random()}`,
					file,
					name: file.name,
					size: file.size,
					type: file.type,
				});
			});

			if (newFiles.length > 0) {
				onChange([...files, ...newFiles]);
				toast.success(`Added ${newFiles.length} file(s)`, {
					description: "Files attached to context",
					duration: 2000,
				});
			}

			if (errors.length > 0) {
				toast.error("Upload Error", {
					description: errors[0],
					duration: 3000,
				});
			}
		},
		[files, onChange, maxFiles, maxSizeMB, acceptedTypes],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			validateAndAddFiles(e.dataTransfer.files);
		},
		[validateAndAddFiles],
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			validateAndAddFiles(e.target.files);
			// Reset input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		},
		[validateAndAddFiles],
	);

	const removeFile = useCallback(
		(id: string) => {
			onChange(files.filter((f) => f.id !== id));
			toast.info("File removed", { duration: 1500 });
		},
		[files, onChange],
	);

	return (
		<div className={className}>
			{/* Compact Upload Button */}
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => fileInputRef.current?.click()}
					className="gap-2 h-8 text-xs"
				>
					<Paperclip className="h-3.5 w-3.5" />
					<span className="hidden sm:inline">Attach Files</span>
					<span className="sm:hidden">Files</span>
					{files.length > 0 && (
						<Badge variant="secondary" className="ml-1 text-[10px] px-1">
							{files.length}
						</Badge>
					)}
				</Button>

				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept={acceptedTypes.join(",")}
					onChange={handleFileSelect}
					className="hidden"
				/>

				{/* Drag and drop zone (compact) */}
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={cn(
						"flex-1 rounded-md border border-dashed px-3 py-1.5 text-xs text-center transition-colors cursor-pointer",
						isDragging
							? "border-primary bg-primary/10 text-primary"
							: "border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:bg-muted/50",
					)}
					onClick={() => fileInputRef.current?.click()}
				>
					<Upload className="h-3 w-3 inline mr-1.5" />
					<span className="hidden sm:inline">
						{isDragging ? "Drop files here" : "Drop or click"}
					</span>
					<span className="sm:hidden">Drop</span>
				</div>
			</div>

			{/* File List - Compact Chips */}
			{files.length > 0 && (
				<div className="mt-2 overflow-x-auto">
					<div className="flex min-w-max flex-nowrap gap-1.5 sm:flex-wrap sm:min-w-0">
						{files.map((file) => (
							<Badge
								key={file.id}
								variant="secondary"
								className="shrink-0 gap-1 pr-1 max-w-[200px] bg-accent/50"
							>
								<File className="h-3 w-3 shrink-0" />
								<span className="truncate text-[10px]">{file.name}</span>
								<span className="text-[9px] opacity-60">
									{formatFileSize(file.size)}
								</span>
								<button
									type="button"
									onClick={() => removeFile(file.id)}
									className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5 transition-colors"
								>
									<X className="h-2.5 w-2.5 hover:text-destructive" />
								</button>
							</Badge>
						))}
					</div>
				</div>
			)}

			{/* Help text */}
			<p className="mt-1 text-muted-foreground text-[10px]">
				Max {maxFiles} files, {maxSizeMB}MB each • {acceptedTypes.join(", ")}
			</p>
		</div>
	);
}
