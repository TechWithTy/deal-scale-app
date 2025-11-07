"use client";
/**
 * SalesScriptManager: Manage sales scripts in Knowledge Base
 * Upload, view, edit, and train AI agents using sales scripts
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import {
	BarChart3,
	Bot,
	File,
	FileText,
	Pencil,
	Plus,
	Search,
	Trash2,
	Upload,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SalesScript {
	id: string;
	name: string;
	type: "Cold Call" | "SMS" | "Follow Up" | "Voicemail" | "Other";
	content: string;
	notes?: string;
	tags: string[];
	addedToKnowledgeBase: boolean;
	useForAITraining: boolean;
	createdAt: Date;
	updatedAt: Date;
	stats?: {
		timesUsed: number;
		avgReplyRate: number;
		conversionRate: number;
		avgEngagementDuration: number;
		lastUsedDate?: Date;
	};
}

export const SalesScriptManager: React.FC = () => {
	const [scripts, setScripts] = useState<SalesScript[]>([]);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(false);
	const [selectedScript, setSelectedScript] = useState<SalesScript | null>(
		null,
	);
	const [searchQuery, setSearchQuery] = useState("");

	// Form state for upload/edit
	const [formData, setFormData] = useState({
		name: "",
		type: "Cold Call" as SalesScript["type"],
		content: "",
		notes: "",
		tags: [] as string[],
		addedToKnowledgeBase: true,
		useForAITraining: false,
	});
	const [tagInput, setTagInput] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [uploadedFileName, setUploadedFileName] = useState("");

	const scriptTypes: SalesScript["type"][] = [
		"Cold Call",
		"SMS",
		"Follow Up",
		"Voicemail",
		"Other",
	];

	const handleUploadScript = () => {
		if (!formData.name.trim() || !formData.content.trim()) {
			toast.error("Please provide script name and content");
			return;
		}

		const newScript: SalesScript = {
			id: `script-${Date.now()}`,
			name: formData.name,
			type: formData.type,
			content: formData.content,
			notes: formData.notes,
			tags: formData.tags,
			addedToKnowledgeBase: formData.addedToKnowledgeBase,
			useForAITraining: formData.useForAITraining,
			createdAt: new Date(),
			updatedAt: new Date(),
			stats: {
				timesUsed: 0,
				avgReplyRate: 0,
				conversionRate: 0,
				avgEngagementDuration: 0,
			},
		};

		setScripts([...scripts, newScript]);
		toast.success("Script added successfully");
		setIsUploadModalOpen(false);
		resetForm();
	};

	const handleEditScript = () => {
		if (!selectedScript) return;

		const updatedScripts = scripts.map((script) =>
			script.id === selectedScript.id
				? {
						...script,
						name: formData.name,
						type: formData.type,
						content: formData.content,
						notes: formData.notes,
						tags: formData.tags,
						addedToKnowledgeBase: formData.addedToKnowledgeBase,
						useForAITraining: formData.useForAITraining,
						updatedAt: new Date(),
					}
				: script,
		);

		setScripts(updatedScripts);
		toast.success("Script updated successfully");
		setIsEditModalOpen(false);
		setSelectedScript(null);
		resetForm();
	};

	const handleDeleteScript = (id: string) => {
		setScripts(scripts.filter((script) => script.id !== id));
		toast.success("Script deleted");
	};

	const openEditModal = (script: SalesScript) => {
		setSelectedScript(script);
		setFormData({
			name: script.name,
			type: script.type,
			content: script.content,
			notes: script.notes || "",
			tags: script.tags,
			addedToKnowledgeBase: script.addedToKnowledgeBase,
			useForAITraining: script.useForAITraining,
		});
		setTagInput("");
		setUploadedFileName("");
		setIsEditModalOpen(true);
	};

	const openStatsDrawer = (script: SalesScript) => {
		setSelectedScript(script);
		setIsStatsDrawerOpen(true);
	};

	const resetForm = () => {
		setFormData({
			name: "",
			type: "Cold Call",
			content: "",
			notes: "",
			tags: [],
			addedToKnowledgeBase: true,
			useForAITraining: false,
		});
		setTagInput("");
		setUploadedFileName("");
	};

	const handleAddTag = () => {
		const input = tagInput.trim();
		if (!input) return;

		// Split by commas to support CSV input
		const newTags = input
			.split(",")
			.map((tag) => tag.trim())
			.filter((tag) => tag && !formData.tags.includes(tag));

		if (newTags.length > 0) {
			setFormData({ ...formData, tags: [...formData.tags, ...newTags] });
			setTagInput("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			handleAddTag();
		} else if (
			e.key === "Backspace" &&
			tagInput === "" &&
			formData.tags.length > 0
		) {
			// Remove last tag on backspace if input is empty
			const newTags = [...formData.tags];
			newTags.pop();
			setFormData({ ...formData, tags: newTags });
		}
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		const validTypes = [
			"text/plain",
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/msword",
		];
		if (!validTypes.includes(file.type)) {
			toast.error("Please upload a .txt, .pdf, or .docx file");
			return;
		}

		// Validate file size (10 MB limit)
		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size must be less than 10 MB");
			return;
		}

		setIsUploading(true);
		setUploadedFileName(file.name);

		try {
			if (file.type === "text/plain") {
				// Handle .txt files
				const text = await file.text();
				setFormData({ ...formData, content: text });
				toast.success("Text file uploaded successfully");
			} else if (file.type === "application/pdf") {
				// Handle PDF files - placeholder for PDF parsing
				// In production, you'd use a library like pdf.js or call a backend API
				toast.info(
					"PDF parsing - placeholder. Use backend API for full support.",
				);
				setFormData({
					...formData,
					content: `[PDF Content from ${file.name}]\n\nNote: PDF parsing requires backend integration. For now, paste content manually or upload as .txt`,
				});
			} else {
				// Handle .docx files - placeholder
				// In production, use mammoth.js or call a backend API
				toast.info(
					"DOCX parsing - placeholder. Use backend API for full support.",
				);
				setFormData({
					...formData,
					content: `[DOCX Content from ${file.name}]\n\nNote: DOCX parsing requires backend integration. For now, paste content manually or upload as .txt`,
				});
			}
		} catch (error) {
			console.error("Error reading file:", error);
			toast.error("Failed to read file. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const filteredScripts = scripts.filter(
		(script) =>
			script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			script.tags.some((tag) =>
				tag.toLowerCase().includes(searchQuery.toLowerCase()),
			),
	);

	const getTypeIcon = (type: SalesScript["type"]) => {
		return <FileText className="h-4 w-4" />;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Sales Scripts</h3>
					<p className="text-muted-foreground text-sm">
						Manage your sales scripts and train AI agents
					</p>
				</div>
				<Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
					<Plus className="h-4 w-4" />
					Upload New Script
				</Button>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search scripts by name or tags..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9"
				/>
			</div>

			{/* Scripts Table */}
			{filteredScripts.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
					<FileText className="mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">No sales scripts found</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						Upload your first script to get started
					</p>
					<Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
						<Upload className="h-4 w-4" />
						Upload Your First Script
					</Button>
				</div>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Script Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Tags</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredScripts.map((script) => (
								<TableRow key={script.id}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											{getTypeIcon(script.type)}
											{script.name}
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline">{script.type}</Badge>
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{script.tags.slice(0, 3).map((tag, idx) => (
												<Badge
													key={idx}
													variant="secondary"
													className="text-xs"
												>
													{tag}
												</Badge>
											))}
											{script.tags.length > 3 && (
												<Badge variant="secondary" className="text-xs">
													+{script.tags.length - 3}
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-1">
											{script.addedToKnowledgeBase && (
												<Badge variant="default" className="w-fit text-xs">
													📚 Knowledge Base
												</Badge>
											)}
											{script.useForAITraining && (
												<Badge variant="default" className="w-fit text-xs">
													🤖 AI-Trained
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell className="text-sm">
										{format(script.createdAt, "MMM d, yyyy")}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openStatsDrawer(script)}
												title="View Stats"
											>
												<BarChart3 className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openEditModal(script)}
												title="Edit Script"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeleteScript(script.id)}
												title="Delete Script"
												className="text-destructive hover:text-destructive"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Upload Modal */}
			<Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Upload New Sales Script</DialogTitle>
						<DialogDescription>
							Add a new script to your knowledge base and optionally train your
							AI agent
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="script-name">Script Name *</Label>
							<Input
								id="script-name"
								placeholder="Cold Call - Seller Pitch"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						<div>
							<Label htmlFor="script-type">Script Type *</Label>
							<Select
								value={formData.type}
								onValueChange={(value: SalesScript["type"]) =>
									setFormData({ ...formData, type: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{scriptTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="script-tags">Tags</Label>
							<div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
								{formData.tags.map((tag, idx) => (
									<Badge
										key={idx}
										variant="secondary"
										className="gap-1 pr-1 pl-2"
									>
										{tag}
										<button
											type="button"
											onClick={() => handleRemoveTag(tag)}
											className="ml-1 rounded-sm hover:bg-muted"
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
								<Input
									id="script-tags"
									placeholder="Add tag and press Enter..."
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={handleTagInputKeyDown}
									onBlur={handleAddTag}
									className="min-w-[200px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
								/>
							</div>
							<p className="mt-1 text-muted-foreground text-xs">
								Press Enter to add tags, or use commas for multiple (e.g.,
								"motivation, investor, seller")
							</p>
						</div>
						<div>
							<Label htmlFor="script-content">Script Content *</Label>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Input
										type="file"
										accept=".txt,.pdf,.doc,.docx"
										onChange={handleFileUpload}
										className="hidden"
										id="file-upload"
										disabled={isUploading}
									/>
									<label htmlFor="file-upload">
										<Button
											type="button"
											variant="outline"
											className="cursor-pointer gap-2"
											disabled={isUploading}
											asChild
										>
											<span>
												{isUploading ? (
													"Uploading..."
												) : (
													<>
														<Upload className="h-4 w-4" />
														Upload File (.txt, .pdf, .docx)
													</>
												)}
											</span>
										</Button>
									</label>
									{uploadedFileName && (
										<span className="flex items-center gap-2 text-muted-foreground text-sm">
											<File className="h-4 w-4" />
											{uploadedFileName}
										</span>
									)}
								</div>
								<Textarea
									id="script-content"
									placeholder="Or paste your sales script here..."
									rows={10}
									value={formData.content}
									onChange={(e) =>
										setFormData({ ...formData, content: e.target.value })
									}
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="script-notes">Notes (Optional)</Label>
							<Textarea
								id="script-notes"
								placeholder="Add any notes about this script..."
								rows={3}
								value={formData.notes}
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
							/>
						</div>
						<div className="space-y-4 rounded-lg border p-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Add to Knowledge Base</Label>
									<p className="text-muted-foreground text-xs">
										Make searchable in your knowledge library
									</p>
								</div>
								<Switch
									checked={formData.addedToKnowledgeBase}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, addedToKnowledgeBase: checked })
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Use for AI Training</Label>
									<p className="text-muted-foreground text-xs">
										Train AI agents for calls and messages
									</p>
								</div>
								<Switch
									checked={formData.useForAITraining}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, useForAITraining: checked })
									}
								/>
							</div>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setIsUploadModalOpen(false);
									resetForm();
								}}
							>
								Cancel
							</Button>
							<Button onClick={handleUploadScript}>Save Script</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Edit Modal */}
			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Edit Sales Script</DialogTitle>
						<DialogDescription>
							Update script details and AI training settings
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="edit-script-name">Script Name *</Label>
							<Input
								id="edit-script-name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
						<div>
							<Label htmlFor="edit-script-type">Script Type *</Label>
							<Select
								value={formData.type}
								onValueChange={(value: SalesScript["type"]) =>
									setFormData({ ...formData, type: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{scriptTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label htmlFor="edit-script-tags">Tags</Label>
							<div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2">
								{formData.tags.map((tag, idx) => (
									<Badge
										key={idx}
										variant="secondary"
										className="gap-1 pr-1 pl-2"
									>
										{tag}
										<button
											type="button"
											onClick={() => handleRemoveTag(tag)}
											className="ml-1 rounded-sm hover:bg-muted"
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
								<Input
									id="edit-script-tags"
									placeholder="Add tag and press Enter..."
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={handleTagInputKeyDown}
									onBlur={handleAddTag}
									className="min-w-[200px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
								/>
							</div>
							<p className="mt-1 text-muted-foreground text-xs">
								Press Enter to add tags, or use commas for multiple (e.g.,
								"motivation, investor, seller")
							</p>
						</div>
						<div>
							<Label htmlFor="edit-script-content">Script Content *</Label>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Input
										type="file"
										accept=".txt,.pdf,.doc,.docx"
										onChange={handleFileUpload}
										className="hidden"
										id="edit-file-upload"
										disabled={isUploading}
									/>
									<label htmlFor="edit-file-upload">
										<Button
											type="button"
											variant="outline"
											className="cursor-pointer gap-2"
											disabled={isUploading}
											asChild
										>
											<span>
												{isUploading ? (
													"Uploading..."
												) : (
													<>
														<Upload className="h-4 w-4" />
														Upload File (.txt, .pdf, .docx)
													</>
												)}
											</span>
										</Button>
									</label>
									{uploadedFileName && (
										<span className="flex items-center gap-2 text-muted-foreground text-sm">
											<File className="h-4 w-4" />
											{uploadedFileName}
										</span>
									)}
								</div>
								<Textarea
									id="edit-script-content"
									placeholder="Or paste your sales script here..."
									rows={10}
									value={formData.content}
									onChange={(e) =>
										setFormData({ ...formData, content: e.target.value })
									}
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="edit-script-notes">Notes (Optional)</Label>
							<Textarea
								id="edit-script-notes"
								placeholder="Add any notes about this script..."
								rows={3}
								value={formData.notes}
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
							/>
						</div>
						<div className="space-y-4 rounded-lg border p-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Add to Knowledge Base</Label>
									<p className="text-muted-foreground text-xs">
										Make searchable in your knowledge library
									</p>
								</div>
								<Switch
									checked={formData.addedToKnowledgeBase}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, addedToKnowledgeBase: checked })
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Use for AI Training</Label>
									<p className="text-muted-foreground text-xs">
										Train AI agents for calls and messages
									</p>
								</div>
								<Switch
									checked={formData.useForAITraining}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, useForAITraining: checked })
									}
								/>
							</div>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setIsEditModalOpen(false);
									setSelectedScript(null);
									resetForm();
								}}
							>
								Cancel
							</Button>
							<Button onClick={handleEditScript}>Save Changes</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Stats Drawer */}
			<Sheet open={isStatsDrawerOpen} onOpenChange={setIsStatsDrawerOpen}>
				<SheetContent className="w-[400px] sm:w-[540px]">
					<SheetHeader>
						<SheetTitle>Script Analytics</SheetTitle>
						<SheetDescription>
							{selectedScript?.name || "Performance metrics"}
						</SheetDescription>
					</SheetHeader>
					{selectedScript && (
						<div className="mt-6 space-y-6">
							<div className="grid gap-4">
								<div className="rounded-lg border p-4">
									<p className="text-muted-foreground text-sm">Times Used</p>
									<p className="font-bold text-2xl">
										{selectedScript.stats?.timesUsed || 0}
									</p>
								</div>
								<div className="rounded-lg border p-4">
									<p className="text-muted-foreground text-sm">
										Avg Reply Rate
									</p>
									<p className="font-bold text-2xl">
										{selectedScript.stats?.avgReplyRate || 0}%
									</p>
								</div>
								<div className="rounded-lg border p-4">
									<p className="text-muted-foreground text-sm">
										Conversion Rate
									</p>
									<p className="font-bold text-2xl">
										{selectedScript.stats?.conversionRate || 0}%
									</p>
								</div>
								<div className="rounded-lg border p-4">
									<p className="text-muted-foreground text-sm">
										Avg Engagement Duration
									</p>
									<p className="font-bold text-2xl">
										{selectedScript.stats?.avgEngagementDuration || 0}s
									</p>
								</div>
								{selectedScript.stats?.lastUsedDate && (
									<div className="rounded-lg border p-4">
										<p className="text-muted-foreground text-sm">Last Used</p>
										<p className="font-semibold text-base">
											{format(selectedScript.stats.lastUsedDate, "MMM d, yyyy")}
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
};

export default SalesScriptManager;
