"use client";

import { Link2, Paperclip, X, Youtube, Image as ImageIcon } from "lucide-react";
import { useMemo, useRef, useState, type DragEvent } from "react";
import { Badge } from "../../../shadcn-table/src/components/ui/badge";
import { Button } from "../../../shadcn-table/src/components/ui/button";
import { CommandInput } from "../../../shadcn-table/src/components/ui/command";
import {
	friendlyGeneratedImageName,
	parseUrlAttachments,
	filenameFromUrl,
} from "../../utils/attachments";

export type CommandInputTrayProps = {
	q: string;
	setQ: (v: string) => void;
};

export default function CommandInputTray({
	q,
	setQ,
}: CommandInputTrayProps): JSX.Element {
	type FileAttachment = {
		id: string;
		file: File;
		url: string;
		type: "image-file" | "file";
	};
	const [isDragging, setIsDragging] = useState(false);
	const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const attachments = useMemo(() => parseUrlAttachments(q), [q]);

	function removeAttachment(value: string) {
		setQ(q.replace(value, "").trim());
	}

	function addFiles(list: FileList): void {
		const next: FileAttachment[] = [];
		Array.from(list).forEach((f) => {
			const id = `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2)}`;
			const url = URL.createObjectURL(f);
			const type = f.type.startsWith("image/") ? "image-file" : "file";
			next.push({ id, file: f, url, type });
		});
		if (next.length) setFileAttachments((prev) => [...prev, ...next]);
	}

	function removeFileAttachment(id: string): void {
		setFileAttachments((prev) => {
			const item = prev.find((p) => p.id === id);
			if (item) URL.revokeObjectURL(item.url);
			return prev.filter((p) => p.id !== id);
		});
	}

	function onDropZoneDragOver(e: DragEvent<HTMLDivElement>): void {
		e.preventDefault();
		setIsDragging(true);
	}
	function onDropZoneDragLeave(): void {
		setIsDragging(false);
	}
	function onDropZoneDrop(e: DragEvent<HTMLDivElement>): void {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer?.files && e.dataTransfer.files.length)
			addFiles(e.dataTransfer.files);
	}

	return (
		<div
			className={`border-b border-border bg-background text-foreground px-3 py-2 ${isDragging ? "bg-accent/30" : ""}`}
			style={{
				backgroundColor: "var(--background)",
				color: "var(--foreground)",
			}}
			onDragOver={onDropZoneDragOver}
			onDragLeave={onDropZoneDragLeave}
			onDrop={onDropZoneDrop}
			aria-label="Command input and attachment tray"
		>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Attach files"
						onClick={() => fileInputRef.current?.click()}
						className="h-8 w-8"
						title="Attach files"
					>
						<Paperclip className="h-4 w-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Add image URL"
						onClick={() => {
							const url = window.prompt(
								"Image URL (can be absolute or relative):",
							);
							if (!url) return;
							const token = url.trim();
							if (!token) return;
							// Inject into the query so the normal parser creates a chip
							setQ(q ? `${q} ${token}` : token);
						}}
						className="h-8 w-8"
						title="Add image URL"
					>
						<ImageIcon className="h-4 w-4" />
					</Button>
					<div className="flex-1">
						<CommandInput
							placeholder="Type a command or search..."
							value={q}
							onValueChange={setQ}
							className="pr-12"
						/>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						multiple
						className="hidden"
						aria-hidden="true"
						onChange={(e) => {
							if (e.currentTarget.files) addFiles(e.currentTarget.files);
							e.currentTarget.value = "";
						}}
					/>
				</div>

				{(attachments.length > 0 || fileAttachments.length > 0) && (
					<div
						className="mt-1.5 flex flex-wrap items-center gap-1.5"
						role="list"
						aria-label="Attachments"
					>
						{attachments
							.filter((a) => a.type !== "image")
							.map((a) => (
								<Badge
									key={a.value}
									variant="secondary"
									className="flex max-w-full items-center gap-1"
									role="listitem"
								>
									{a.type === "youtube" ? (
										<Youtube className="h-3.5 w-3.5" />
									) : (
										<Link2 className="h-3.5 w-3.5" />
									)}
									<span className="max-w-[240px] truncate" title={a.value}>
										{a.value}
									</span>
									<button
										type="button"
										className="ml-1 rounded p-0.5 hover:bg-accent"
										aria-label={`Remove ${a.value}`}
										onClick={(e) => {
											e.stopPropagation();
											removeAttachment(a.value);
										}}
									>
										<X className="h-3 w-3" />
									</button>
								</Badge>
							))}

						{attachments
							.filter((a) => a.type === "image")
							.map((a) => {
								const inferred = filenameFromUrl(a.value);
								const label = inferred ?? friendlyGeneratedImageName();
								return (
									<Badge
										key={`img-${a.value}`}
										variant="secondary"
										className="flex max-w-full items-center gap-1"
										role="listitem"
										title={label}
									>
										<ImageIcon className="h-3.5 w-3.5" />
										<span className="max-w-[200px] truncate">{label}</span>
										<a
											href={a.value}
											target="_blank"
											rel="noreferrer"
											className="ml-1 rounded p-0.5 hover:bg-accent"
											aria-label={`Open image`}
										>
											<Link2 className="h-3 w-3" />
										</a>
										<button
											type="button"
											className="ml-1 rounded p-0.5 hover:bg-accent"
											aria-label={`Remove image`}
											onClick={(e) => {
												e.stopPropagation();
												removeAttachment(a.value);
											}}
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								);
							})}

						{(fileAttachments as FileAttachment[]).map((f: FileAttachment) => (
							<Badge
								key={f.id}
								variant="secondary"
								className="flex max-w-full items-center gap-1"
								role="listitem"
								title={f.file.name}
							>
								{f.type === "image-file" ? (
									<ImageIcon className="h-3.5 w-3.5" />
								) : (
									<Paperclip className="h-3.5 w-3.5" />
								)}
								<span className="max-w-[200px] truncate">{f.file.name}</span>
								<a
									href={f.url}
									target="_blank"
									rel="noreferrer"
									className="ml-1 rounded p-0.5 hover:bg-accent"
									aria-label={`Open ${f.file.name}`}
								>
									<Link2 className="h-3 w-3" />
								</a>
								<button
									type="button"
									className="ml-1 rounded p-0.5 hover:bg-accent"
									aria-label={`Remove ${f.file.name}`}
									onClick={(e) => {
										e.stopPropagation();
										removeFileAttachment(f.id);
									}}
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
