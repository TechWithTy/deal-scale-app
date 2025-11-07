"use client";
/**
 * VoiceManager: Unified voice management system
 * Record, clone, create, and manage all voices in one place
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CloneModal } from "@/external/teleprompter-modal";
import { format } from "date-fns";
import {
	BarChart3,
	Copy,
	Mic,
	Pause,
	Pencil,
	Play,
	Plus,
	Search,
	Trash2,
	Volume2,
	Wand2,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CreateVoiceModal from "./voice/CreateVoiceModal";
import VoicemailModal from "./voice/VoicemailModal";

interface Voice {
	id: string;
	name: string;
	type: "Recording" | "Clone" | "Generated";
	audioUrl?: string;
	tags: string[];
	notes?: string;
	useForCalls: boolean;
	useForVoicemail: boolean;
	createdAt: Date;
	updatedAt: Date;
	stats?: {
		timesUsed: number;
		avgRating: number;
		totalCallDuration: number;
		lastUsedDate?: Date;
	};
}

export const VoiceManager: React.FC = () => {
	const [voices, setVoices] = useState<Voice[]>([]);
	const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
	const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(false);
	const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

	// Voice creation modals
	const [showRecordModal, setShowRecordModal] = useState(false);
	const [showCloneModal, setShowCloneModal] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);

	// Form state for editing
	const [formData, setFormData] = useState({
		name: "",
		notes: "",
		tags: [] as string[],
		useForCalls: false,
		useForVoicemail: false,
	});
	const [tagInput, setTagInput] = useState("");

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
			const newTags = [...formData.tags];
			newTags.pop();
			setFormData({ ...formData, tags: newTags });
		}
	};

	const handleVoiceRecorded = async (audioBlob: Blob) => {
		const newVoice: Voice = {
			id: `voice-${Date.now()}`,
			name: `Recording ${voices.length + 1}`,
			type: "Recording",
			audioUrl: URL.createObjectURL(audioBlob),
			tags: [],
			useForCalls: false,
			useForVoicemail: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			stats: {
				timesUsed: 0,
				avgRating: 0,
				totalCallDuration: 0,
			},
		};

		setVoices([...voices, newVoice]);
		toast.success("Voice recorded successfully");
		setShowRecordModal(false);
	};

	const handleVoiceCloned = async (audioBlob: Blob) => {
		const newVoice: Voice = {
			id: `voice-clone-${Date.now()}`,
			name: `Cloned Voice ${voices.length + 1}`,
			type: "Clone",
			audioUrl: URL.createObjectURL(audioBlob),
			tags: [],
			useForCalls: true,
			useForVoicemail: false,
			createdAt: new Date(),
			updatedAt: new Date(),
			stats: {
				timesUsed: 0,
				avgRating: 0,
				totalCallDuration: 0,
			},
		};

		setVoices([...voices, newVoice]);
		toast.success("Voice cloned successfully");
		setShowCloneModal(false);
	};

	const handleVoiceCreated = async (audioBlob: Blob) => {
		const newVoice: Voice = {
			id: `voice-gen-${Date.now()}`,
			name: `Generated Voice ${voices.length + 1}`,
			type: "Generated",
			audioUrl: URL.createObjectURL(audioBlob),
			tags: [],
			useForCalls: true,
			useForVoicemail: false,
			createdAt: new Date(),
			updatedAt: new Date(),
			stats: {
				timesUsed: 0,
				avgRating: 0,
				totalCallDuration: 0,
			},
		};

		setVoices([...voices, newVoice]);
		toast.success("Voice created successfully");
		setShowCreateModal(false);
	};

	const handleEditVoice = () => {
		if (!selectedVoice) return;

		const updatedVoices = voices.map((voice) =>
			voice.id === selectedVoice.id
				? {
						...voice,
						name: formData.name,
						notes: formData.notes,
						tags: formData.tags,
						useForCalls: formData.useForCalls,
						useForVoicemail: formData.useForVoicemail,
						updatedAt: new Date(),
					}
				: voice,
		);

		setVoices(updatedVoices);
		toast.success("Voice updated successfully");
		setIsDetailsModalOpen(false);
		setSelectedVoice(null);
		resetForm();
	};

	const handleDeleteVoice = (id: string) => {
		setVoices(voices.filter((voice) => voice.id !== id));
		toast.success("Voice deleted");
	};

	const openDetailsModal = (voice: Voice) => {
		setSelectedVoice(voice);
		setFormData({
			name: voice.name,
			notes: voice.notes || "",
			tags: voice.tags,
			useForCalls: voice.useForCalls,
			useForVoicemail: voice.useForVoicemail,
		});
		setTagInput("");
		setIsDetailsModalOpen(true);
	};

	const openStatsDrawer = (voice: Voice) => {
		setSelectedVoice(voice);
		setIsStatsDrawerOpen(true);
	};

	const resetForm = () => {
		setFormData({
			name: "",
			notes: "",
			tags: [],
			useForCalls: false,
			useForVoicemail: false,
		});
		setTagInput("");
	};

	const filteredVoices = voices.filter(
		(voice) =>
			voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			voice.tags.some((tag) =>
				tag.toLowerCase().includes(searchQuery.toLowerCase()),
			),
	);

	const getTypeIcon = (type: Voice["type"]) => {
		switch (type) {
			case "Recording":
				return <Mic className="h-4 w-4 text-blue-600" />;
			case "Clone":
				return <Copy className="h-4 w-4 text-purple-600" />;
			case "Generated":
				return <Wand2 className="h-4 w-4 text-green-600" />;
		}
	};

	const getTypeBadgeColor = (type: Voice["type"]) => {
		switch (type) {
			case "Recording":
				return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
			case "Clone":
				return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
			case "Generated":
				return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Voice Library</h3>
					<p className="text-muted-foreground text-sm">
						Record, clone, and manage all your AI voices
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={() => setShowRecordModal(true)}
						variant="outline"
						className="gap-2"
					>
						<Mic className="h-4 w-4" />
						Record
					</Button>
					<Button
						onClick={() => setShowCloneModal(true)}
						variant="outline"
						className="gap-2"
					>
						<Copy className="h-4 w-4" />
						Clone
					</Button>
					<Button onClick={() => setShowCreateModal(true)} className="gap-2">
						<Wand2 className="h-4 w-4" />
						Create Voice
					</Button>
				</div>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search voices by name or tags..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9"
				/>
			</div>

			{/* Voices Table */}
			{filteredVoices.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
					<Volume2 className="mb-4 h-12 w-12 text-muted-foreground" />
					<h3 className="mb-2 font-semibold text-lg">No voices found</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						Record, clone, or create your first voice to get started
					</p>
					<div className="flex gap-2">
						<Button
							onClick={() => setShowRecordModal(true)}
							variant="outline"
							className="gap-2"
						>
							<Mic className="h-4 w-4" />
							Record Voice
						</Button>
						<Button onClick={() => setShowCloneModal(true)} className="gap-2">
							<Copy className="h-4 w-4" />
							Clone Voice
						</Button>
					</div>
				</div>
			) : (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Voice Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Tags</TableHead>
								<TableHead>Usage</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredVoices.map((voice) => (
								<TableRow key={voice.id}>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											{getTypeIcon(voice.type)}
											{voice.name}
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={getTypeBadgeColor(voice.type)}
										>
											{voice.type}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{voice.tags.slice(0, 2).map((tag, idx) => (
												<Badge
													key={idx}
													variant="secondary"
													className="text-xs"
												>
													{tag}
												</Badge>
											))}
											{voice.tags.length > 2 && (
												<Badge variant="secondary" className="text-xs">
													+{voice.tags.length - 2}
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-1">
											{voice.useForCalls && (
												<Badge variant="default" className="w-fit text-xs">
													📞 Calls
												</Badge>
											)}
											{voice.useForVoicemail && (
												<Badge variant="default" className="w-fit text-xs">
													📨 Voicemail
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell className="text-sm">
										{format(voice.createdAt, "MMM d, yyyy")}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											{voice.audioUrl && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														const audio = new Audio(voice.audioUrl);
														if (playingVoiceId === voice.id) {
															audio.pause();
															setPlayingVoiceId(null);
														} else {
															audio.play();
															setPlayingVoiceId(voice.id);
															audio.onended = () => setPlayingVoiceId(null);
														}
													}}
													title={
														playingVoiceId === voice.id ? "Pause" : "Play Voice"
													}
												>
													{playingVoiceId === voice.id ? (
														<Pause className="h-4 w-4" />
													) : (
														<Play className="h-4 w-4" />
													)}
												</Button>
											)}
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openStatsDrawer(voice)}
												title="View Stats"
											>
												<BarChart3 className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openDetailsModal(voice)}
												title="Edit Voice"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDeleteVoice(voice.id)}
												title="Delete Voice"
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

			{/* Edit Voice Details Modal */}
			<Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Edit Voice Details</DialogTitle>
						<DialogDescription>
							Update voice name, tags, and usage settings
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="voice-name">Voice Name *</Label>
							<Input
								id="voice-name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Professional Sales Voice"
							/>
						</div>
						<div>
							<Label htmlFor="voice-tags">Tags</Label>
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
									id="voice-tags"
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
								"professional, warm, clear")
							</p>
						</div>
						<div>
							<Label htmlFor="voice-notes">Notes (Optional)</Label>
							<Textarea
								id="voice-notes"
								placeholder="Add any notes about this voice..."
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
									<Label>Use for Calls</Label>
									<p className="text-muted-foreground text-xs">
										Use this voice for outbound calls
									</p>
								</div>
								<Switch
									checked={formData.useForCalls}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, useForCalls: checked })
									}
								/>
							</div>
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Use for Voicemail</Label>
									<p className="text-muted-foreground text-xs">
										Use this voice for voicemail messages
									</p>
								</div>
								<Switch
									checked={formData.useForVoicemail}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, useForVoicemail: checked })
									}
								/>
							</div>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setIsDetailsModalOpen(false);
									setSelectedVoice(null);
									resetForm();
								}}
							>
								Cancel
							</Button>
							<Button onClick={handleEditVoice}>Save Changes</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Stats Drawer */}
			<Sheet open={isStatsDrawerOpen} onOpenChange={setIsStatsDrawerOpen}>
				<SheetContent className="w-[400px] sm:w-[540px]">
					<SheetHeader>
						<SheetTitle>Voice Analytics</SheetTitle>
						<SheetDescription>
							{selectedVoice?.name || "Performance metrics"}
						</SheetDescription>
					</SheetHeader>
					{selectedVoice && (
						<div className="mt-6 space-y-6">
							<div className="grid gap-4">
								<div className="rounded-lg border p-4">
									<p className="text-muted-foreground text-sm">Times Used</p>
									<p className="font-bold text-2xl">
										{selectedVoice.stats?.timesUsed || 0}
									</p>
								</div>
								<div className="rounded-lg border p-4">
									<p className="text-muted-foreground text-sm">
										Average Rating
									</p>
									<p className="font-bold text-2xl">
										{selectedVoice.stats?.avgRating.toFixed(1) || 0}/5
									</p>
								</div>
								<div className="rounded-lg border p-4">
									<p className="text-muted-foreground text-sm">
										Total Call Duration
									</p>
									<p className="font-bold text-2xl">
										{Math.floor(
											(selectedVoice.stats?.totalCallDuration || 0) / 60,
										)}
										m
									</p>
								</div>
								{selectedVoice.stats?.lastUsedDate && (
									<div className="rounded-lg border p-4">
										<p className="text-muted-foreground text-sm">Last Used</p>
										<p className="font-semibold text-base">
											{format(selectedVoice.stats.lastUsedDate, "MMM d, yyyy")}
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>

			{/* Voice Creation Modals */}
			<VoicemailModal
				open={showRecordModal}
				onClose={() => setShowRecordModal(false)}
				onSave={handleVoiceRecorded}
			/>
			<CloneModal
				open={showCloneModal}
				onClose={() => setShowCloneModal(false)}
				onSave={handleVoiceCloned}
			/>
			<CreateVoiceModal
				open={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSave={handleVoiceCreated}
			/>
		</div>
	);
};

export default VoiceManager;
