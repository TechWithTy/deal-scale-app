import { Button } from "@/components/ui/button";
import type React from "react";
import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

export const assetsSchema = z
	.array(
		z
			.instanceof(File)
			.refine(
				(file) => file.type.startsWith("image/"),
				"Asset must be an image",
			),
	)
	.min(1, "At least 1 asset required")
	.max(12, "Maximum 12 assets allowed");

import { v4 as uuidv4 } from "uuid";

type AssetItem = {
	id: string;
	file: File;
};

type AssetsUploaderProps = {
	value: AssetItem[];
	onChange: (files: AssetItem[]) => void;
	error?: string;
};

function truncateMiddle(str: string, maxLength = 18) {
	if (str.length <= maxLength) return str;
	const keep = Math.floor((maxLength - 3) / 2);
	// biome-ignore lint/style/useTemplate: <explanation>
	return str.slice(0, keep) + "..." + str.slice(-keep);
}

export const AssetsUploader: React.FC<AssetsUploaderProps> = ({
	value,
	onChange,
	error,
}) => {
	const { trigger } = useFormContext();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFiles = (files: FileList | null) => {
		if (!files) return;
		const newItems: AssetItem[] = Array.from(files)
			.filter((file) => file.type.startsWith("image/"))
			.map((file) => ({ id: uuidv4(), file }));
		// Prevent exceeding 12
		const updatedFiles = [...value, ...newItems].slice(0, 12);
		onChange(updatedFiles);
		trigger("companyAssets");
	};

	const handleRemove = (id: string) => {
		const newFiles = value.filter((item) => item.id !== id);
		onChange(newFiles);
		trigger("companyAssets");
	};

	return (
		<div className="w-full">
			<label
				htmlFor="assets-upload"
				className="mb-3 block font-semibold text-base"
			>
				Company Assets
			</label>
			<div
				className="mb-4 w-full cursor-pointer rounded-lg border-2 border-border border-dashed bg-muted/30 p-8 transition-all hover:border-primary/50 hover:bg-muted/50"
				onClick={() => inputRef.current?.click()}
				onDragOver={(e) => {
					e.preventDefault();
					e.currentTarget.classList.add("border-primary", "bg-primary/5");
				}}
				onDragLeave={(e) => {
					e.currentTarget.classList.remove("border-primary", "bg-primary/5");
				}}
				onDrop={(e) => {
					e.preventDefault();
					e.currentTarget.classList.remove("border-primary", "bg-primary/5");
					handleFiles(e.dataTransfer.files);
				}}
				role="button"
				tabIndex={0}
				aria-label="Upload company assets"
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						inputRef.current?.click();
					}
				}}
			>
				<input
					id="assets-upload"
					ref={inputRef}
					type="file"
					accept="image/*"
					multiple
					className="hidden"
					onChange={(e) => handleFiles(e.target.files)}
				/>
				<div className="flex flex-col items-center justify-center text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="mb-3 h-12 w-12 text-muted-foreground"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
						/>
					</svg>
					<span className="mb-1 font-medium text-foreground text-sm">
						Click to upload or drag and drop
					</span>
					<span className="text-muted-foreground text-xs">
						Upload 3-12 professional images (PNG, JPG, WebP)
					</span>
					{value.length > 0 && (
						<span className="mt-2 font-semibold text-primary text-xs">
							{value.length} file{value.length !== 1 ? "s" : ""} selected
						</span>
					)}
				</div>
			</div>

			{value.length > 0 && (
				<div className="space-y-3">
					<div className="flex items-center justify-between rounded-lg border bg-card p-3">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<span className="font-bold text-primary text-sm">
									{value.length}
								</span>
							</div>
							<div>
								<p className="font-semibold text-sm">
									{value.length}/12 Assets Uploaded
								</p>
								<p className="text-muted-foreground text-xs">
									{value.length < 3
										? `${3 - value.length} more needed (minimum 3)`
										: "Looking good! ✓"}
								</p>
							</div>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => inputRef.current?.click()}
							disabled={value.length >= 12}
						>
							+ Add More
						</Button>
					</div>
					<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
						{value.map((item) => (
							<div
								key={item.id}
								className="group relative aspect-square overflow-hidden rounded-lg border-2 border-border bg-card shadow-sm transition-all hover:border-primary hover:shadow-md"
							>
								<img
									src={URL.createObjectURL(item.file)}
									alt={item.file.name}
									className="h-full w-full object-cover transition-transform group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
								<button
									type="button"
									className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-lg transition-opacity hover:bg-destructive/90 group-hover:opacity-100"
									onClick={() => handleRemove(item.id)}
									aria-label="Remove image"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
								<div className="absolute right-0 bottom-0 left-0 bg-black/70 px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
									<p className="truncate font-medium text-white text-xs">
										{item.file.name}
									</p>
									<p className="text-white/70 text-xs">
										{(item.file.size / 1024).toFixed(0)} KB
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{error && (
				<p className="mt-2 font-medium text-destructive text-sm">{error}</p>
			)}
		</div>
	);
};
