import type React from "react";
import { useRef } from "react";
import { z } from "zod";
import { useFormContext } from "react-hook-form";

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
		<div>
			<label htmlFor="assets-upload" className="mb-2 block font-semibold">
				Company Assets
			</label>
			<button
				type="button"
				className="mb-2 flex flex-col items-center rounded-md border border-dashed bg-gray-50 p-4"
				onClick={() => inputRef.current?.click()}
				aria-label="Upload company assets"
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
				<span className="text-gray-400">
					Drag & drop or click to upload (1-12 images)
				</span>
			</button>
			<div className="mb-2 grid grid-cols-2 items-start gap-4 md:grid-cols-4">
				{value.map((item) => (
					<div
						key={item.id}
						className="relative mr-4 mb-4 inline-block h-24 w-24 rounded border border-gray-200 bg-gray-900"
					>
						<img
							src={URL.createObjectURL(item.file)}
							alt={item.file.name}
							className="h-full w-full rounded object-cover"
						/>
						<button
							type="button"
							className="absolute top-1 right-1 z-10 rounded-full bg-white p-1 text-red-500 hover:bg-gray-100"
							onClick={() => handleRemove(item.id)}
							aria-label="Remove image"
						>
							&times;
						</button>
						<div className="absolute bottom-0 left-0 w-full truncate rounded-b bg-black/70 px-1 py-0.5 text-center text-gray-100 text-xs">
							{truncateMiddle(item.file.name, 18)}
						</div>
					</div>
				))}
			</div>
			<div className="mb-1 text-gray-500 text-xs">
				{value.length}/12 images selected
			</div>
			{error && <p className="text-red-500 text-xs">{error}</p>}
		</div>
	);
};
