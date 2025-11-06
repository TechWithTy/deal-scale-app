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
		<div className="w-full">
			<label htmlFor="logo" className="mb-3 block font-semibold text-base">
				Company Logo
			</label>
			<div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50 sm:flex-row sm:items-center">
				<div
					className={cn(
						"flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border-2 bg-white shadow-sm transition-all",
						value
							? "border-primary"
							: "border-dashed border-muted-foreground/30",
					)}
				>
					{value ? (
						<img
							src={URL.createObjectURL(value)}
							alt="Logo preview"
							className="h-full w-full object-contain p-2"
						/>
					) : (
						<div className="flex flex-col items-center justify-center p-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-10 w-10 text-muted-foreground"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<span className="mt-1 text-muted-foreground text-xs">
								No logo
							</span>
						</div>
					)}
				</div>
				<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
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
						variant="default"
						className="w-full sm:w-auto"
					>
						{value ? "Replace Logo" : "Upload Logo"}
					</Button>
					{value && (
						<Button
							type="button"
							variant="outline"
							onClick={() => onChange(null)}
							className="w-full sm:w-auto"
						>
							Remove
						</Button>
					)}
				</div>
			</div>
			{value && (
				<p className="mt-2 text-muted-foreground text-xs">
					📎 {value.name} ({(value.size / 1024).toFixed(1)} KB)
				</p>
			)}
			{error && <p className="mt-1 text-destructive text-xs">{error}</p>}
		</div>
	);
};
