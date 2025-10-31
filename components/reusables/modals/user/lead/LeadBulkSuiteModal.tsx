"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import FieldMappingStep from "../skipTrace/steps/FieldMappingStep";
import SkipTraceSummaryStep from "./steps/SkipTraceSummaryStep";
import { areRequiredFieldsMapped, autoMapCsvHeaders } from "./utils/csvAutoMap";
import { deriveRecommendedEnrichmentOptions } from "./utils/enrichmentRecommendations";
import { useLeadListStore } from "@/lib/stores/leadList";
import {
	calculateLeadStatistics,
	parseCsvToLeads,
} from "@/lib/stores/_utils/csvParser";
import Papa from "papaparse";
import { downloadLeadCsvTemplate } from "@/components/quickstart/utils/downloadLeadCsvTemplate";

const INITIAL_COST_DETAILS = {
	availableCredits: 0,
	estimatedCredits: 0,
	premiumCostPerLead: 0,
	hasEnoughCredits: true,
};

interface BulkSuiteModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialCsvFile: File | null;
	initialCsvHeaders: string[];
	onSuiteLaunchComplete?: (payload: {
		leadListId: string;
		leadListName: string;
		leadCount: number;
	}) => boolean | void;
}

const deriveDefaultListName = (file?: File | null) => {
	if (!file) return "New Lead List";
	const base = file.name.replace(/\.[^/.]+$/, "");
	return base || "New Lead List";
};

export default function LeadBulkSuiteModal({
	isOpen,
	onClose,
	initialCsvFile,
	initialCsvHeaders,
	onSuiteLaunchComplete,
}: BulkSuiteModalProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const addLeadList = useLeadListStore((state) => state.addLeadList);

	const [step, setStep] = useState(0);
	const [listName, setListName] = useState(() =>
		deriveDefaultListName(initialCsvFile),
	);
	const [modalCsvFile, setModalCsvFile] = useState<File | null>(initialCsvFile);
	const [csvHeaders, setCsvHeaders] = useState<string[]>(
		initialCsvHeaders ?? [],
	);
	const [selectedHeaders, setSelectedHeaders] = useState<
		Record<string, string | undefined>
	>({});
	const [canProceedFromMapping, setCanProceedFromMapping] = useState(false);
	const [selectedEnrichmentOptions, setSelectedEnrichmentOptions] = useState<
		string[]
	>([]);
	const [csvRowCount, setCsvRowCount] = useState(0);
	const [csvContent, setCsvContent] = useState("");
	const [isLaunchingSuite, setIsLaunchingSuite] = useState(false);
	const [costDetails, setCostDetails] = useState(INITIAL_COST_DETAILS);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const parsedToastShownRef = useRef<boolean>(false);
	const launchToastIdRef = useRef<string | number | null>(null);

	const hasEnoughCredits = costDetails.hasEnoughCredits;

	const deriveRowCount = useCallback((text: string | null | undefined) => {
		if (!text) {
			setCsvRowCount(0);
			return;
		}
		try {
			const parsed = Papa.parse<Record<string, string | number | null>>(text, {
				header: true,
				skipEmptyLines: "greedy",
			});
			if (Array.isArray(parsed.data)) {
				const meaningfulRows = parsed.data.filter((row) =>
					Object.values(row).some(
						(value) => `${value ?? ""}`.trim().length > 0,
					),
				);
				setCsvRowCount(meaningfulRows.length);
				return;
			}
		} catch (error) {
			console.warn("Failed to parse CSV for row count", error);
		}
		const fallbackLines = text
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length);
		setCsvRowCount(Math.max(fallbackLines.length - 1, 0));
	}, []);

	useEffect(() => {
		setModalCsvFile(initialCsvFile);
		setCsvHeaders(initialCsvHeaders ?? []);
		setListName(deriveDefaultListName(initialCsvFile));
		setSelectedHeaders((prev) => {
			if (initialCsvHeaders?.length) {
				const autoMapped = autoMapCsvHeaders(initialCsvHeaders, prev);
				setCanProceedFromMapping(areRequiredFieldsMapped(autoMapped));
				setSelectedEnrichmentOptions(
					deriveRecommendedEnrichmentOptions(autoMapped),
				);
				return autoMapped;
			}
			setCanProceedFromMapping(false);
			setSelectedEnrichmentOptions([]);
			return {};
		});
		setCsvContent("");
		setCsvRowCount(0);
		setCostDetails(INITIAL_COST_DETAILS);
		setErrors({});
		setStep(initialCsvHeaders?.length ? 1 : 0);
		parsedToastShownRef.current = false;
	}, [initialCsvFile, initialCsvHeaders]);

	useEffect(() => {
		if (!modalCsvFile) {
			setCsvContent("");
			setCsvRowCount(0);
			return;
		}
		let isActive = true;
		modalCsvFile
			.text()
			.then((text) => {
				if (!isActive) return;
				setCsvContent(text);
				deriveRowCount(text);
			})
			.catch(() => {
				if (!isActive) return;
				setCsvRowCount(0);
			});
		return () => {
			isActive = false;
		};
	}, [modalCsvFile, deriveRowCount]);

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleCsvUpload = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		if (!file.name.endsWith(".csv") && !file.type.includes("csv")) {
			toast.error("Please select a CSV file");
			return;
		}
		setModalCsvFile(file);
		setListName(deriveDefaultListName(file));

		const reader = new FileReader();
		reader.onload = (e) => {
			const csvText = e.target?.result as string;
			if (!csvText) return;
			const lines = csvText
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length);
			if (lines.length === 0) {
				toast.error("CSV file appears to be empty");
				return;
			}
			const headers = lines[0]
				.split(",")
				.map((header) => header.trim().replace(/"/g, ""))
				.filter((header) => header.length > 0)
				.slice(0, 50);
			if (headers.length === 0) {
				toast.error("No valid headers found in CSV file");
				return;
			}
			setCsvHeaders(headers);
			setSelectedHeaders((prev) => {
				const autoMapped = autoMapCsvHeaders(headers, prev);
				setCanProceedFromMapping(areRequiredFieldsMapped(autoMapped));
				setSelectedEnrichmentOptions(
					deriveRecommendedEnrichmentOptions(autoMapped),
				);
				return autoMapped;
			});
			setCsvContent(csvText);
			deriveRowCount(csvText);
			toast.success(
				`Found ${headers.length} columns in CSV: ${headers
					.slice(0, 3)
					.join(", ")}${headers.length > 3 ? "..." : ""}`,
			);
			setStep(1);
			parsedToastShownRef.current = false;
		};
		reader.onerror = () => toast.error("Error reading CSV file");
		reader.readAsText(file);
	};

	// When mapping is done and summary step is visible, parse CSV to compute true parsed lead count
	// and show a confirmation toast once. This uses parser rules (skips empty rows) for accuracy.
	useEffect(() => {
		if (step !== 2) return;
		if (!csvContent) return;
		if (parsedToastShownRef.current) return;
		try {
			const leads = parseCsvToLeads(csvContent, selectedHeaders);
			setCsvRowCount(leads.length);
			toast.success(`Parsed ${leads.length.toLocaleString()} leads from CSV`);
		} catch {
			// ignore; handled on launch
		}
		parsedToastShownRef.current = true;
	}, [step, csvContent, selectedHeaders]);

	const handleHeaderSelect = (fieldName: string, value: string) => {
		setSelectedHeaders((prev) => {
			const next = { ...prev, [fieldName]: value || undefined };
			setCanProceedFromMapping(areRequiredFieldsMapped(next));
			return next;
		});
	};

	const handleToggleEnrichmentOption = (optionId: string) => {
		setSelectedEnrichmentOptions((prev) =>
			prev.includes(optionId)
				? prev.filter((id) => id !== optionId)
				: [...prev, optionId],
		);
	};

	const handleCostDetailsChange = useCallback(
		(details: {
			availableCredits: number;
			estimatedCredits: number;
			premiumCostPerLead: number;
			hasEnoughCredits: boolean;
		}) => {
			setCostDetails(details);
		},
		[],
	);

	const handleLaunchSuite = async () => {
		const trimmedListName = listName.trim();
		const problems: Record<string, string> = {};
		if (!trimmedListName) {
			problems.listName = "List name is required";
		}
		if (!areRequiredFieldsMapped(selectedHeaders)) {
			problems.mappings = "Please map all required fields before launching.";
		}
		if (selectedEnrichmentOptions.length === 0) {
			problems.enrichment = "Select at least one enrichment tool to continue.";
		}
		if (!hasEnoughCredits) {
			problems.credits = "Not enough skip trace credits to launch.";
		}
		setErrors(problems);
		if (Object.keys(problems).length > 0 || isLaunchingSuite) return;
		if (!csvContent) {
			toast.error("Unable to read CSV content. Please re-upload the file.");
			return;
		}

		setIsLaunchingSuite(true);
		const launchToastId = toast.loading("Launching enrichment suite...");

		try {
			const leads = parseCsvToLeads(csvContent, selectedHeaders);
			const stats = calculateLeadStatistics(leads);
			const newLeadList = {
				listName: trimmedListName,
				leads,
				records: stats.total,
				phone: stats.phone,
				dataLink: modalCsvFile?.name || "uploaded_file.csv",
				socials: stats.socials,
				emails: stats.email,
			};

			const newLeadListId = addLeadList(newLeadList);
			const payload = {
				leadListId: newLeadListId,
				leadListName: newLeadList.listName,
				leadCount: leads.length,
			};

			onSuiteLaunchComplete?.(payload);
			onClose();
			toast.dismiss(launchToastId);
			toast.success(
				`Skip trace suite launched for ${
					leads.length > 0 ? leads.length.toLocaleString() : "your"
				} leads and saved to lead lists`,
			);
		} catch (error) {
			console.error("Failed to launch enrichment suite", error);
			toast.dismiss(launchToastId);
			toast.error("Failed to launch enrichment suite. Please try again.");
		} finally {
			setIsLaunchingSuite(false);
		}
	};

	const canProceed = useMemo(() => {
		if (isLaunchingSuite) return false;
		if (step === 0) return Boolean(listName.trim());
		if (step === 1) return canProceedFromMapping;
		if (step === 2) {
			if (selectedEnrichmentOptions.length === 0) return false;
			return hasEnoughCredits;
		}
		return true;
	}, [
		step,
		isLaunchingSuite,
		listName,
		canProceedFromMapping,
		selectedEnrichmentOptions,
		hasEnoughCredits,
	]);

	const primaryLabel = useMemo(() => {
		if (step === 2) {
			if (!hasEnoughCredits && costDetails.estimatedCredits > 0)
				return "Add Credits";
			return isLaunchingSuite ? "Launching..." : "Launch Suite";
		}
		return "Next";
	}, [step, hasEnoughCredits, costDetails.estimatedCredits, isLaunchingSuite]);

	const goNext = () => {
		if (step === 0) {
			if (!listName.trim()) {
				setErrors((prev) => ({ ...prev, listName: "List name is required" }));
				return;
			}
			setErrors((prev) => ({ ...prev, listName: undefined }));
			setStep(1);
			return;
		}
		if (step === 1) {
			if (canProceedFromMapping) {
				setStep(2);
			}
			return;
		}
	};

	const goBack = () => {
		setErrors({});
		setStep((prev) => Math.max(0, prev - 1));
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-w-2xl">
				<div className="space-y-6">
					{step === 0 && (
						<div className="space-y-4">
							<div className="space-y-2">
								<h2 className="text-lg font-semibold text-foreground">
									Name Your Lead List
								</h2>
								<p className="text-sm text-muted-foreground">
									Upload your CSV and give the list a recognizable name before
									mapping fields.
								</p>
							</div>
							<div className="space-y-2">
								<label
									className="text-sm font-medium text-foreground"
									htmlFor="bulk-list-name"
								>
									List Name
								</label>
								<input
									id="bulk-list-name"
									type="text"
									value={listName}
									onChange={(event) => setListName(event.target.value)}
									className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
									placeholder="e.g., August Outreach List"
								/>
								{errors.listName && (
									<p className="text-sm text-destructive">{errors.listName}</p>
								)}
							</div>
							<div className="space-y-2">
								<Button
									onClick={triggerFileInput}
									variant="outline"
									type="button"
									className="w-full"
								>
									<Upload className="mr-2 h-4 w-4" />
									{modalCsvFile ? "Change CSV File" : "Upload CSV File"}
								</Button>
								<Button
									onClick={() => downloadLeadCsvTemplate()}
									variant="ghost"
									type="button"
									className="w-full"
								>
									<Download className="mr-2 h-4 w-4" />
									Download sample CSV
								</Button>
								{modalCsvFile && (
									<div className="text-sm text-muted-foreground">
										<p className="font-medium">{modalCsvFile.name}</p>
										<p>{csvHeaders.length} columns detected</p>
									</div>
								)}
								<input
									ref={fileInputRef}
									type="file"
									accept=".csv,text/csv"
									onChange={handleCsvUpload}
									className="hidden"
								/>
							</div>
						</div>
					)}

					{step === 1 && (
						<FieldMappingStep
							headers={csvHeaders}
							selectedHeaders={selectedHeaders}
							onHeaderSelect={handleHeaderSelect}
							errors={
								errors.mappings
									? { mappings: { message: errors.mappings } }
									: {}
							}
							onCanProceedChange={(value) => setCanProceedFromMapping(value)}
						/>
					)}

					{step === 2 && (
						<SkipTraceSummaryStep
							selectedHeaders={selectedHeaders}
							selectedOptions={selectedEnrichmentOptions}
							onToggleOption={handleToggleEnrichmentOption}
							leadCount={csvRowCount}
							onCostDetailsChange={handleCostDetailsChange}
							isLaunching={isLaunchingSuite}
						/>
					)}

					<div className="mt-6 flex items-center justify-between">
						<Button
							onClick={step === 0 ? onClose : goBack}
							variant="outline"
							type="button"
						>
							Back
						</Button>
						<Button
							onClick={() => {
								if (step === 2) {
									handleLaunchSuite();
									return;
								}
								goNext();
							}}
							disabled={!canProceed}
							type="button"
						>
							{primaryLabel}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
