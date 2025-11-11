"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useModalStore } from "@/lib/stores/dashboard";
import type { AdPlatform, LookalikeCandidate } from "@/types/lookalike";
import {
	Download,
	ExternalLink,
	Facebook,
	FileText,
	Link as LinkIcon,
	Linkedin,
	Loader2,
	Save,
	TrendingUp,
	Webhook,
	Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { exportWithMetadata } from "./utils/exportToCsv";

interface LookalikeResultsModalProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	candidates: LookalikeCandidate[];
	seedListName: string;
	onSaveAsList: (
		listName: string,
		selectedCandidates: LookalikeCandidate[],
	) => Promise<void>;
	onExport: (
		platforms: AdPlatform[],
		selectedCandidates: LookalikeCandidate[],
	) => Promise<void>;
	existingLookalikeVersions?: number; // Optional: for auto-incrementing version
}

export function LookalikeResultsModal({
	isOpen,
	onOpenChange,
	candidates,
	seedListName,
	onSaveAsList,
	onExport,
	existingLookalikeVersions = 0,
}: LookalikeResultsModalProps) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isSaving, setIsSaving] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	// Store the seed list name locally when modal first opens
	// This prevents it from being lost if parent state changes
	const [localSeedListName, setLocalSeedListName] = useState(seedListName);

	// Generate versioned list name: "Lookalike - {seedListName} - v0.0{version}"
	const generateVersionedName = (version: number, name: string) => {
		const versionStr = version.toString().padStart(2, "0");
		const baseName = name || "Seed List";
		return `Lookalike - ${baseName} - v0.${versionStr}`;
	};

	const [listName, setListName] = useState(() =>
		generateVersionedName(
			existingLookalikeVersions + 1,
			seedListName || "Seed List",
		),
	);
	const [exportPlatforms, setExportPlatforms] = useState<Set<AdPlatform>>(
		new Set(),
	);
	const [exportToCsv, setExportToCsv] = useState(false);
	const [includeEnrichedData, setIncludeEnrichedData] = useState(true);

	const router = useRouter();
	const { openWebhookModal } = useModalStore();

	// Update local seed list name and regenerate list name when modal opens with new data
	useEffect(() => {
		if (isOpen && seedListName && seedListName !== localSeedListName) {
			console.log(
				"[LookalikeResults] Modal opened with new seed list:",
				seedListName,
			);
			setLocalSeedListName(seedListName);
			const newName = generateVersionedName(
				existingLookalikeVersions + 1,
				seedListName,
			);
			console.log("[LookalikeResults] Generated list name:", newName);
			setListName(newName);
		}
	}, [isOpen, seedListName, existingLookalikeVersions, localSeedListName]);

	const candidatesArray = Array.isArray(candidates) ? candidates : [];
	const selectedCandidates = candidatesArray.filter((c) =>
		selectedIds.has(c.id),
	);
	const allSelected =
		candidatesArray.length > 0 && selectedIds.size === candidatesArray.length;

	const toggleAll = () => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(candidatesArray.map((c) => c.id)));
		}
	};

	const toggleCandidate = (id: string) => {
		const newSet = new Set(selectedIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		setSelectedIds(newSet);
	};

	const togglePlatform = (platform: AdPlatform) => {
		const newSet = new Set(exportPlatforms);
		if (newSet.has(platform)) {
			newSet.delete(platform);
		} else {
			newSet.add(platform);
		}
		setExportPlatforms(newSet);
	};

	const handleSave = async () => {
		if (selectedCandidates.length === 0) {
			toast.error("Please select at least one lead");
			return;
		}

		if (!listName.trim()) {
			toast.error("Please enter a list name");
			return;
		}

		setIsSaving(true);
		try {
			await onSaveAsList(listName, selectedCandidates);
			toast.success(
				`Saved ${selectedCandidates.length} leads to "${listName}"`,
			);
		} catch (error) {
			toast.error("Failed to save leads");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleConnectCRM = async (platform: string) => {
		// Validate selection
		if (selectedCandidates.length === 0) {
			toast.error("Please select at least one lead");
			return;
		}

		if (!listName.trim()) {
			toast.error("Please enter a list name");
			return;
		}

		try {
			setIsSaving(true);

			// Save the lead list first
			await onSaveAsList(listName, selectedCandidates);
			toast.success(
				`Saved ${selectedCandidates.length} leads to "${listName}"`,
			);

			// Small delay to show success message
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Navigate to OAuth setup with platform parameter
			router.push(
				`/dashboard/profile#oauth?` +
					`platform=${platform}&` +
					`source=lookalike&` +
					`listName=${encodeURIComponent(listName)}&` +
					`leadCount=${selectedCandidates.length}`,
			);

			toast.info(`Redirecting to ${platform} OAuth setup...`);
		} catch (error) {
			toast.error("Failed to save leads");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleSetupWebhook = async () => {
		// Validate selection
		if (selectedCandidates.length === 0) {
			toast.error("Please select at least one lead");
			return;
		}

		if (!listName.trim()) {
			toast.error("Please enter a list name");
			return;
		}

		try {
			setIsSaving(true);

			// Save the lead list first
			await onSaveAsList(listName, selectedCandidates);
			toast.success(
				`Saved ${selectedCandidates.length} leads to "${listName}"`,
			);

			// Small delay to show success message
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Close results modal
			onOpenChange(false);

			// Small delay before opening webhook modal for smooth transition
			setTimeout(() => {
				// Open webhook modal for leads
				openWebhookModal("outgoing", "leads");
				toast.info("Configure webhook to sync leads to your system");
			}, 200);
		} catch (error) {
			toast.error("Failed to save leads");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleExport = async () => {
		if (selectedCandidates.length === 0) {
			toast.error("Please select at least one lead");
			return;
		}

		if (exportPlatforms.size === 0 && !exportToCsv) {
			toast.error("Please select at least one export option");
			return;
		}

		setIsExporting(true);
		try {
			// Handle CSV export
			if (exportToCsv) {
				const avgScore =
					selectedCandidates.reduce((sum, c) => sum + c.similarityScore, 0) /
					selectedCandidates.length;

				exportWithMetadata(
					selectedCandidates,
					{
						seedListName,
						generatedAt: new Date().toISOString(),
						totalCandidates: selectedCandidates.length,
						avgScore,
					},
					{
						includeEnrichedData,
						filename: `lookalike-${seedListName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.csv`,
					},
				);

				toast.success(`Exported ${selectedCandidates.length} leads to CSV`);
			}

			// Handle ad platform exports
			if (exportPlatforms.size > 0) {
				await onExport(Array.from(exportPlatforms), selectedCandidates);
				toast.success(
					`Exporting ${selectedCandidates.length} leads to ${exportPlatforms.size} platform(s)`,
				);
			}
		} catch (error) {
			toast.error("Failed to export");
			console.error(error);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="mx-4 flex h-[95vh] max-w-6xl flex-col overflow-hidden p-3 sm:mx-auto sm:p-6">
				<DialogHeader className="shrink-0">
					<DialogTitle className="text-lg sm:text-xl">
						Look-Alike Audience Results
					</DialogTitle>
					<DialogDescription className="text-xs sm:text-sm">
						Found {candidatesArray.length} similar leads based on {seedListName}
						. Select leads to save or export to ad platforms.
					</DialogDescription>
				</DialogHeader>

				<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden sm:gap-4">
					{/* Selection Summary */}
					<div className="flex shrink-0 flex-col items-start justify-between gap-3 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-center sm:p-4">
						<div className="flex items-center gap-3 sm:gap-4">
							<Checkbox checked={allSelected} onCheckedChange={toggleAll} />
							<span className="font-medium text-xs sm:text-sm">
								{selectedIds.size} of {candidatesArray.length} selected
							</span>
						</div>

						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="text-xs">
								Avg Score:{" "}
								{candidatesArray.length > 0
									? (
											candidatesArray.reduce(
												(sum, c) => sum + c.similarityScore,
												0,
											) / candidatesArray.length
										).toFixed(1)
									: 0}
								%
							</Badge>
						</div>
					</div>

					{/* Candidates Table */}
					<div className="max-h-[500px] min-h-[300px] flex-1 overflow-auto rounded-lg border sm:min-h-[400px]">
						{candidatesArray.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
								<h3 className="mb-2 font-semibold text-lg">
									No Candidates Generated
								</h3>
								<p className="max-w-md text-muted-foreground text-sm">
									No leads matched your filter criteria. Try adjusting your
									similarity threshold or removing some filters to get more
									results.
								</p>
							</div>
						) : (
							<Table>
								<TableHeader className="sticky top-0 z-10 bg-background">
									<TableRow>
										<TableHead className="w-8 text-xs sm:w-12"></TableHead>
										<TableHead className="text-xs sm:text-sm">Score</TableHead>
										<TableHead className="text-xs sm:text-sm">Name</TableHead>
										<TableHead className="hidden text-xs sm:table-cell sm:text-sm">
											Property
										</TableHead>
										<TableHead className="text-xs sm:text-sm">
											Location
										</TableHead>
										<TableHead className="hidden text-xs sm:text-sm md:table-cell">
											Value
										</TableHead>
										<TableHead className="hidden text-xs sm:text-sm md:table-cell">
											Contact
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{candidatesArray.map((candidate) => (
										<TableRow
											key={candidate.id}
											className={
												selectedIds.has(candidate.id) ? "bg-accent/50" : ""
											}
										>
											<TableCell className="py-2 sm:py-3">
												<Checkbox
													checked={selectedIds.has(candidate.id)}
													onCheckedChange={() => toggleCandidate(candidate.id)}
												/>
											</TableCell>
											<TableCell className="py-2 sm:py-3">
												<Badge
													variant="outline"
													className="whitespace-nowrap font-mono text-xs"
												>
													{candidate.similarityScore}%
												</Badge>
											</TableCell>
											<TableCell className="py-2 font-medium sm:py-3">
												<div className="max-w-[120px] truncate text-xs sm:max-w-none sm:text-sm">
													{candidate.firstName} {candidate.lastName}
												</div>
											</TableCell>
											<TableCell className="hidden py-2 sm:table-cell sm:py-3">
												<div className="text-xs sm:text-sm">
													<div className="max-w-[150px] truncate capitalize">
														{candidate.propertyType.replace("-", " ")}
													</div>
													<div className="max-w-[150px] truncate text-muted-foreground text-xs">
														{candidate.address}
													</div>
												</div>
											</TableCell>
											<TableCell className="py-2 sm:py-3">
												<div className="text-xs sm:text-sm">
													<div className="max-w-[100px] truncate sm:max-w-none">
														{candidate.city}, {candidate.state}
													</div>
													<div className="text-muted-foreground text-xs">
														{candidate.zipCode}
													</div>
												</div>
											</TableCell>
											<TableCell className="hidden whitespace-nowrap py-2 text-xs sm:py-3 sm:text-sm md:table-cell">
												{candidate.estimatedValue
													? `$${candidate.estimatedValue.toLocaleString()}`
													: "—"}
											</TableCell>
											<TableCell className="hidden py-2 sm:py-3 md:table-cell">
												<div className="text-xs">
													{candidate.phoneNumber && (
														<div className="max-w-[120px] truncate">
															📞 {candidate.phoneNumber.slice(0, 12)}...
														</div>
													)}
													{candidate.email && (
														<div className="max-w-[120px] truncate">
															📧 {candidate.email.slice(0, 15)}...
														</div>
													)}
													{!candidate.phoneNumber && !candidate.email && (
														<span className="text-muted-foreground">—</span>
													)}
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</div>

					{/* Save & Export Section */}
					<div className="shrink-0 space-y-3 rounded-lg border bg-card p-3 sm:space-y-4 sm:p-4">
						<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
							{/* Save as List */}
							<div className="space-y-3">
								<Label
									htmlFor="listName"
									className="flex items-center justify-between text-xs sm:text-sm"
								>
									<span>Save as Lead List</span>
									<span className="font-normal text-muted-foreground text-xs">
										Version: {existingLookalikeVersions + 1}
									</span>
								</Label>
								<div className="flex flex-col gap-2 sm:flex-row">
									<Input
										id="listName"
										value={listName}
										onChange={(e) => setListName(e.target.value)}
										placeholder="Lookalike - {List Name} - v0.01"
										className="min-w-0 text-xs sm:text-sm"
									/>
									<Button
										onClick={handleSave}
										disabled={isSaving || selectedIds.size === 0}
										className="shrink-0"
										size="default"
									>
										{isSaving ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<>
												<Save className="mr-2 h-4 w-4" />
												Save
											</>
										)}
									</Button>
								</div>

								{/* CRM & Webhook Sync Options */}
								<div className="space-y-2 rounded border bg-muted/30 p-2 sm:p-3">
									<p className="flex items-center gap-2 font-medium text-muted-foreground text-xs">
										<Zap className="h-3 w-3" />
										Sync to Your Systems
									</p>

									<div className="flex flex-col gap-2">
										{/* CRM Connections */}
										<div className="flex flex-wrap gap-1.5 sm:gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleConnectCRM("gohighlevel")}
												disabled={selectedIds.size === 0}
												className="h-7 px-2 text-[10px] sm:h-8 sm:px-3 sm:text-xs"
											>
												<LinkIcon className="mr-1 h-3 w-3 sm:mr-1.5" />
												<span className="max-w-[80px] truncate sm:max-w-none">
													GoHighLevel
												</span>
												<ExternalLink className="ml-1 h-3 w-3 opacity-50 sm:ml-1.5" />
											</Button>

											<Button
												variant="outline"
												size="sm"
												onClick={() => handleConnectCRM("lofty")}
												disabled={selectedIds.size === 0}
												className="h-7 px-2 text-[10px] sm:h-8 sm:px-3 sm:text-xs"
											>
												<LinkIcon className="mr-1 h-3 w-3 sm:mr-1.5" />
												<span className="truncate">Lofty</span>
												<ExternalLink className="ml-1 h-3 w-3 opacity-50 sm:ml-1.5" />
											</Button>

											<Button
												variant="outline"
												size="sm"
												onClick={() => handleConnectCRM("salesforce")}
												disabled={selectedIds.size === 0}
												className="h-7 px-2 text-[10px] sm:h-8 sm:px-3 sm:text-xs"
											>
												<LinkIcon className="mr-1 h-3 w-3 sm:mr-1.5" />
												<span className="truncate">Salesforce</span>
												<ExternalLink className="ml-1 h-3 w-3 opacity-50 sm:ml-1.5" />
											</Button>

											<Button
												variant="outline"
												size="sm"
												onClick={() => handleConnectCRM("zoho")}
												disabled={selectedIds.size === 0}
												className="h-7 px-2 text-[10px] sm:h-8 sm:px-3 sm:text-xs"
											>
												<LinkIcon className="mr-1 h-3 w-3 sm:mr-1.5" />
												<span className="truncate">Zoho</span>
												<ExternalLink className="ml-1 h-3 w-3 opacity-50 sm:ml-1.5" />
											</Button>
										</div>

										{/* Webhook Option */}
										<Button
											variant="outline"
											size="sm"
											onClick={handleSetupWebhook}
											disabled={selectedIds.size === 0}
											className="h-7 justify-start text-[10px] sm:h-8 sm:text-xs"
										>
											<Webhook className="mr-1 h-3 w-3 shrink-0 sm:mr-1.5" />
											<span className="truncate">
												Setup Webhook Integration
											</span>
											<span className="ml-auto hidden text-[10px] text-muted-foreground sm:inline">
												Custom sync
											</span>
										</Button>
									</div>

									<p className="text-[10px] text-muted-foreground leading-tight sm:text-xs">
										Connect your CRM or setup webhooks to automatically sync
										leads
									</p>
								</div>
							</div>

							{/* Export Options */}
							<div className="space-y-2">
								<Label className="text-xs sm:text-sm">Export Options</Label>
								<div className="flex flex-col gap-3">
									{/* Ad Platforms */}
									<div>
										<p className="mb-2 text-muted-foreground text-xs">
											Ad Platforms
										</p>
										<div className="flex flex-wrap gap-2">
											<label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded border px-2 py-1.5 hover:bg-accent sm:gap-2 sm:px-3 sm:py-2">
												<Checkbox
													checked={exportPlatforms.has("meta")}
													onCheckedChange={() => togglePlatform("meta")}
												/>
												<Facebook className="h-3 w-3 shrink-0 text-blue-600 sm:h-4 sm:w-4" />
												<span className="whitespace-nowrap text-xs sm:text-sm">
													Meta
												</span>
											</label>

											<label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded border px-2 py-1.5 hover:bg-accent sm:gap-2 sm:px-3 sm:py-2">
												<Checkbox
													checked={exportPlatforms.has("google")}
													onCheckedChange={() => togglePlatform("google")}
												/>
												<span className="shrink-0 font-bold text-red-600 text-xs sm:text-sm">
													G
												</span>
												<span className="whitespace-nowrap text-xs sm:text-sm">
													Google
												</span>
											</label>

											<label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded border px-2 py-1.5 hover:bg-accent sm:gap-2 sm:px-3 sm:py-2">
												<Checkbox
													checked={exportPlatforms.has("linkedin")}
													onCheckedChange={() => togglePlatform("linkedin")}
												/>
												<Linkedin className="h-3 w-3 shrink-0 text-blue-700 sm:h-4 sm:w-4" />
												<span className="whitespace-nowrap text-xs sm:text-sm">
													LinkedIn
												</span>
											</label>
										</div>
									</div>

									{/* CSV Export */}
									<div className="space-y-2">
										<p className="text-muted-foreground text-xs">File Export</p>
										<label className="flex cursor-pointer items-center gap-1.5 rounded border bg-muted/30 px-2 py-1.5 hover:bg-accent sm:gap-2 sm:px-3 sm:py-2">
											<Checkbox
												checked={exportToCsv}
												onCheckedChange={(checked) =>
													setExportToCsv(Boolean(checked))
												}
											/>
											<FileText className="h-3 w-3 shrink-0 text-green-600 sm:h-4 sm:w-4" />
											<span className="text-xs sm:text-sm">Export to CSV</span>
										</label>

										{exportToCsv && (
											<label className="ml-4 flex items-center gap-2 text-sm sm:ml-6">
												<Checkbox
													checked={includeEnrichedData}
													onCheckedChange={(checked) =>
														setIncludeEnrichedData(Boolean(checked))
													}
												/>
												<span className="text-[10px] text-muted-foreground leading-tight sm:text-xs">
													Include enriched data (property value, equity, contact
													info)
												</span>
											</label>
										)}
									</div>

									<Button
										onClick={handleExport}
										disabled={
											isExporting ||
											selectedIds.size === 0 ||
											(exportPlatforms.size === 0 && !exportToCsv)
										}
										className="w-full"
										size="default"
									>
										{isExporting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												<span className="truncate">Exporting...</span>
											</>
										) : (
											<>
												<Download className="mr-2 h-4 w-4 shrink-0" />
												<span className="truncate">
													Export {selectedIds.size} lead
													{selectedIds.size !== 1 ? "s" : ""}
												</span>
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
