"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Save,
	Download,
	Loader2,
	TrendingUp,
	Facebook,
	Linkedin,
	FileText,
	Webhook,
	Link as LinkIcon,
	ExternalLink,
	Zap,
} from "lucide-react";
import type { LookalikeCandidate, AdPlatform } from "@/types/lookalike";
import { toast } from "sonner";
import { exportWithMetadata } from "./utils/exportToCsv";
import { useModalStore } from "@/lib/stores/dashboard";
import { useRouter } from "next/navigation";

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
			<DialogContent className="max-w-6xl h-[95vh] overflow-hidden flex flex-col p-3 sm:p-6">
				<DialogHeader className="shrink-0">
					<DialogTitle className="text-lg sm:text-xl">
						Look-Alike Audience Results
					</DialogTitle>
					<DialogDescription className="text-xs sm:text-sm">
						Found {candidatesArray.length} similar leads based on {seedListName}
						. Select leads to save or export to ad platforms.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-3 sm:gap-4 min-h-0">
					{/* Selection Summary */}
					<div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg">
						<div className="flex items-center gap-3 sm:gap-4">
							<Checkbox checked={allSelected} onCheckedChange={toggleAll} />
							<span className="text-xs sm:text-sm font-medium">
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
					<div className="flex-1 min-h-[300px] sm:min-h-[400px] max-h-[500px] overflow-auto border rounded-lg">
						{candidatesArray.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="font-semibold text-lg mb-2">
									No Candidates Generated
								</h3>
								<p className="text-muted-foreground text-sm max-w-md">
									No leads matched your filter criteria. Try adjusting your
									similarity threshold or removing some filters to get more
									results.
								</p>
							</div>
						) : (
							<Table>
								<TableHeader className="sticky top-0 bg-background z-10">
									<TableRow>
										<TableHead className="w-8 sm:w-12 text-xs"></TableHead>
										<TableHead className="text-xs sm:text-sm">Score</TableHead>
										<TableHead className="text-xs sm:text-sm">Name</TableHead>
										<TableHead className="hidden sm:table-cell text-xs sm:text-sm">
											Property
										</TableHead>
										<TableHead className="text-xs sm:text-sm">
											Location
										</TableHead>
										<TableHead className="hidden md:table-cell text-xs sm:text-sm">
											Value
										</TableHead>
										<TableHead className="hidden md:table-cell text-xs sm:text-sm">
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
													className="font-mono text-xs whitespace-nowrap"
												>
													{candidate.similarityScore}%
												</Badge>
											</TableCell>
											<TableCell className="font-medium py-2 sm:py-3">
												<div className="text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">
													{candidate.firstName} {candidate.lastName}
												</div>
											</TableCell>
											<TableCell className="hidden sm:table-cell py-2 sm:py-3">
												<div className="text-xs sm:text-sm">
													<div className="capitalize truncate max-w-[150px]">
														{candidate.propertyType.replace("-", " ")}
													</div>
													<div className="text-muted-foreground text-xs truncate max-w-[150px]">
														{candidate.address}
													</div>
												</div>
											</TableCell>
											<TableCell className="py-2 sm:py-3">
												<div className="text-xs sm:text-sm">
													<div className="truncate max-w-[100px] sm:max-w-none">
														{candidate.city}, {candidate.state}
													</div>
													<div className="text-muted-foreground text-xs">
														{candidate.zipCode}
													</div>
												</div>
											</TableCell>
											<TableCell className="hidden md:table-cell py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
												{candidate.estimatedValue
													? `$${candidate.estimatedValue.toLocaleString()}`
													: "—"}
											</TableCell>
											<TableCell className="hidden md:table-cell py-2 sm:py-3">
												<div className="text-xs">
													{candidate.phoneNumber && (
														<div className="truncate max-w-[120px]">
															📞 {candidate.phoneNumber.slice(0, 12)}...
														</div>
													)}
													{candidate.email && (
														<div className="truncate max-w-[120px]">
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
					<div className="shrink-0 space-y-3 sm:space-y-4 rounded-lg border bg-card p-3 sm:p-4">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
							{/* Save as List */}
							<div className="space-y-3">
								<Label
									htmlFor="listName"
									className="flex items-center justify-between text-xs sm:text-sm"
								>
									<span>Save as Lead List</span>
									<span className="text-xs font-normal text-muted-foreground">
										Version: {existingLookalikeVersions + 1}
									</span>
								</Label>
								<div className="flex flex-col sm:flex-row gap-2">
									<Input
										id="listName"
										value={listName}
										onChange={(e) => setListName(e.target.value)}
										placeholder="Lookalike - {List Name} - v0.01"
										className="text-xs sm:text-sm min-w-0"
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
									<p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
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
												className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
											>
												<LinkIcon className="mr-1 sm:mr-1.5 h-3 w-3" />
												<span className="truncate max-w-[80px] sm:max-w-none">
													GoHighLevel
												</span>
												<ExternalLink className="ml-1 sm:ml-1.5 h-3 w-3 opacity-50" />
											</Button>

											<Button
												variant="outline"
												size="sm"
												onClick={() => handleConnectCRM("lofty")}
												disabled={selectedIds.size === 0}
												className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
											>
												<LinkIcon className="mr-1 sm:mr-1.5 h-3 w-3" />
												<span className="truncate">Lofty</span>
												<ExternalLink className="ml-1 sm:ml-1.5 h-3 w-3 opacity-50" />
											</Button>

											<Button
												variant="outline"
												size="sm"
												onClick={() => handleConnectCRM("salesforce")}
												disabled={selectedIds.size === 0}
												className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
											>
												<LinkIcon className="mr-1 sm:mr-1.5 h-3 w-3" />
												<span className="truncate">Salesforce</span>
												<ExternalLink className="ml-1 sm:ml-1.5 h-3 w-3 opacity-50" />
											</Button>

											<Button
												variant="outline"
												size="sm"
												onClick={() => handleConnectCRM("zoho")}
												disabled={selectedIds.size === 0}
												className="h-7 sm:h-8 text-[10px] sm:text-xs px-2 sm:px-3"
											>
												<LinkIcon className="mr-1 sm:mr-1.5 h-3 w-3" />
												<span className="truncate">Zoho</span>
												<ExternalLink className="ml-1 sm:ml-1.5 h-3 w-3 opacity-50" />
											</Button>
										</div>

										{/* Webhook Option */}
										<Button
											variant="outline"
											size="sm"
											onClick={handleSetupWebhook}
											disabled={selectedIds.size === 0}
											className="h-7 sm:h-8 justify-start text-[10px] sm:text-xs"
										>
											<Webhook className="mr-1 sm:mr-1.5 h-3 w-3 shrink-0" />
											<span className="truncate">
												Setup Webhook Integration
											</span>
											<span className="ml-auto text-[10px] text-muted-foreground hidden sm:inline">
												Custom sync
											</span>
										</Button>
									</div>

									<p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
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
										<p className="mb-2 text-xs text-muted-foreground">
											Ad Platforms
										</p>
										<div className="flex flex-wrap gap-2">
											<label className="flex items-center gap-1.5 sm:gap-2 rounded border px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-accent shrink-0">
												<Checkbox
													checked={exportPlatforms.has("meta")}
													onCheckedChange={() => togglePlatform("meta")}
												/>
												<Facebook className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600 shrink-0" />
												<span className="text-xs sm:text-sm whitespace-nowrap">
													Meta
												</span>
											</label>

											<label className="flex items-center gap-1.5 sm:gap-2 rounded border px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-accent shrink-0">
												<Checkbox
													checked={exportPlatforms.has("google")}
													onCheckedChange={() => togglePlatform("google")}
												/>
												<span className="font-bold text-red-600 text-xs sm:text-sm shrink-0">
													G
												</span>
												<span className="text-xs sm:text-sm whitespace-nowrap">
													Google
												</span>
											</label>

											<label className="flex items-center gap-1.5 sm:gap-2 rounded border px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-accent shrink-0">
												<Checkbox
													checked={exportPlatforms.has("linkedin")}
													onCheckedChange={() => togglePlatform("linkedin")}
												/>
												<Linkedin className="h-3 sm:h-4 w-3 sm:w-4 text-blue-700 shrink-0" />
												<span className="text-xs sm:text-sm whitespace-nowrap">
													LinkedIn
												</span>
											</label>
										</div>
									</div>

									{/* CSV Export */}
									<div className="space-y-2">
										<p className="text-xs text-muted-foreground">File Export</p>
										<label className="flex items-center gap-1.5 sm:gap-2 rounded border bg-muted/30 px-2 sm:px-3 py-1.5 sm:py-2 cursor-pointer hover:bg-accent">
											<Checkbox
												checked={exportToCsv}
												onCheckedChange={(checked) =>
													setExportToCsv(Boolean(checked))
												}
											/>
											<FileText className="h-3 sm:h-4 w-3 sm:w-4 text-green-600 shrink-0" />
											<span className="text-xs sm:text-sm">Export to CSV</span>
										</label>

										{exportToCsv && (
											<label className="ml-4 sm:ml-6 flex items-center gap-2 text-sm">
												<Checkbox
													checked={includeEnrichedData}
													onCheckedChange={(checked) =>
														setIncludeEnrichedData(Boolean(checked))
													}
												/>
												<span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
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
