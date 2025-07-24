import type React from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { cn } from "@/lib/_utils";

export const logoSchema = z
	.instanceof(File)
	.refine((file) => file.type.startsWith("image/"), "Logo must be an image");

type LogoUploaderProps = {
	value: File | null;
	onChange: (file: File | null) => void;
	error?: string;
};

export const LogoUploader: React.FC<LogoUploaderProps> = ({
	value,
	onChange,
	error,
}) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		onChange(file);
	};

	return (
		<div>
			<label htmlFor="logo" className="mb-2 block font-semibold">
				Company Logo
			</label>
			<div className="flex items-center gap-4">
				<div
					className={cn(
						"flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-gray-100",
						value ? "" : "border-dashed",
					)}
				>
					{value ? (
						<img
							src={URL.createObjectURL(value)}
							alt="Logo preview"
							className="h-full w-full object-cover"
						/>
					) : (
						<span className="text-gray-400 text-xs">No logo</span>
					)}
				</div>
				<div>
					<input
						ref={inputRef}
						type="file"
						accept="image/*"
						className="hidden"
						onChange={handleFileChange}
						aria-label="Upload company logo"
					/>
					<Button
						type="button"
						onClick={() => inputRef.current?.click()}
						variant="secondary"
					>
						{value ? "Replace Logo" : "Add Logo"}
					</Button>
					{value && (
						<Button
							type="button"
							variant="ghost"
							onClick={() => onChange(null)}
							className="ml-2"
						>
							Remove
						</Button>
					)}
				</div>
			</div>
			{error && <p className="mt-1 text-red-500 text-xs">{error}</p>}
		</div>
	);
};
