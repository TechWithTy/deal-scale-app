"use client";

import LeadAddressStep from "./steps/LeadAddressStep";
import LeadBasicInfoStep from "./steps/LeadBasicInfoStep";
import LeadContactStep from "./steps/LeadContactStep";
import LeadSocialsStep from "./steps/LeadSocialsStep";
import LeadListSelectStep from "./steps/LeadListSelectStep";
import { LEAD_LISTS_MOCK } from "@/constants/dashboard/leadLists.mock";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLeadModalState } from "./hooks/useLeadModalState";
import FieldMappingStep, {
	REQUIRED_FIELD_MAPPING_KEYS,
} from "../skipTrace/steps/FieldMappingStep";
import SkipTraceSummaryStep from "./steps/SkipTraceSummaryStep";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLeadListStore } from "@/lib/stores/leadList";
import {
	parseCsvToLeads,
	calculateLeadStatistics,
} from "@/lib/stores/_utils/csvParser";
import Papa from "papaparse";
import { areRequiredFieldsMapped, autoMapCsvHeaders } from "./utils/csvAutoMap";
import { deriveRecommendedEnrichmentOptions } from "./utils/enrichmentRecommendations";
import { downloadLeadCsvTemplate } from "@/components/quickstart/utils/downloadLeadCsvTemplate";

const INITIAL_COST_DETAILS = {
	availableCredits: 0,
	estimatedCredits: 0,
	premiumCostPerLead: 0,
	hasEnoughCredits: true,
};

// * Main Lead Modal Component: Combines all modular steps
interface LeadMainModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialListMode?: "select" | "create";
	csvFile?: File | null;
	csvHeaders?: string[];
	onLaunchCampaign?: (payload: {
		leadListId: string;
		leadListName: string;
		leadCount: number;
	}) => void;
	onSuiteLaunchComplete?: (payload: {
		leadListId: string;
		leadListName: string;
		leadCount: number;
	}) => boolean | void;
}

function LeadMainModal({
	isOpen,
	onClose,
	initialListMode = "create",
	csvFile,
	csvHeaders: externalCsvHeaders,
	onLaunchCampaign,
	onSuiteLaunchComplete,
}: LeadMainModalProps) {
	// Field mapping state (only used when creating a list)
	// Initialize with external CSV data if provided
	const [modalCsvFile, setModalCsvFile] = useState<File | null>(
		csvFile || null,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [csvHeaders, setCsvHeaders] = useState<string[]>(
		externalCsvHeaders || [],
	);
	const [selectedHeadersState, setSelectedHeadersState] = useState<
		Record<string, string | undefined>
	>({});
	const [canProceedFromMapping, setCanProceedFromMapping] = useState(false);
	const [selectedEnrichmentOptions, setSelectedEnrichmentOptions] = useState<
		string[]
	>([]);
	const [csvRowCount, setCsvRowCount] = useState(0);
	const [isLaunchingSuite, setIsLaunchingSuite] = useState(false);
	const [costDetails, setCostDetails] = useState(INITIAL_COST_DETAILS);
	const [csvContent, setCsvContent] = useState<string>("");

	// Get the lead list store
	const addLeadList = useLeadListStore((state) => state.addLeadList);
	const leadLists = useLeadListStore((state) => state.leadLists);

	const resetCostDetails = useCallback(() => {
		setCostDetails({ ...INITIAL_COST_DETAILS });
	}, []);

	const combinedExistingLists = useMemo(() => {
		const storeLists = leadLists.map((list) => ({
			id: list.id,
			name: list.listName ?? "Lead List",
		}));
		const seen = new Set(storeLists.map((list) => list.id));
		const fallbackLists = LEAD_LISTS_MOCK.filter((mock) => !seen.has(mock.id));
		return [...storeLists, ...fallbackLists];
	}, [leadLists]);

	const launchCampaignIfPossible = useCallback(
		(payload: {
			leadListId: string;
			leadListName: string;
			leadCount: number;
		}) => {
			if (!onLaunchCampaign) {
				console.warn(
					"launchCampaignIfPossible called without onLaunchCampaign handler",
				);
				return false;
			}
			console.log("📨 Launching campaign with payload", payload);
			resetCostDetails();
			onLaunchCampaign(payload);
			onClose();
			return true;
		},
		[onLaunchCampaign, resetCostDetails, onClose],
	);

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

	// Centralized state via hook - must come after CSV state initialization
	const {
		// list
		listMode,
		setListMode,
		selectedListId,
		setSelectedListId,
		newListName,
		setNewListName,
		// form
		firstName,
		setFirstName,
		lastName,
		setLastName,
		address,
		setAddress,
		city,
		setCity,
		stateValue,
		setStateValue,
		zipCode,
		setZipCode,
		phoneNumber,
		setPhoneNumber,
		email,
		setEmail,
		facebook,
		setFacebook,
		linkedin,
		setLinkedin,
		socialHandle,
		setSocialHandle,
		socialSummary,
		setSocialSummary,
		isIphone,
		setIsIphone,
		preferCall,
		setPreferCall,
		preferSms,
		setPreferSms,
		bestContactTime,
		setBestContactTime,
		leadNotes,
		setLeadNotes,
		listNotes,
		setListNotes,
		// DNC and TCPA fields
		dncStatus,
		setDncStatus,
		dncSource,
		setDncSource,
		tcpaOptedIn,
		setTcpaOptedIn,
		// ui
		step,
		setStep,
		errors,
		setErrors,
		validateStepNow,
	} = useLeadModalState(
		initialListMode,
		isOpen,
		Boolean(csvFile && externalCsvHeaders && externalCsvHeaders.length > 0),
	);

	// Simple setters (live validation handled on step/submit)
	const handleFirstNameChange = (v: string) => setFirstName(v);
	const handleLastNameChange = (v: string) => setLastName(v);
	const handleAddressChange = (v: string) => setAddress(v);
	const handleCityChange = (v: string) => setCity(v);
	const handleStateChange = (v: string) => setStateValue(v);
	const handleZipCodeChange = (v: string) => setZipCode(v);
	const handlePhoneNumberChange = (v: string) => setPhoneNumber(v);
	const handleEmailChange = (v: string) => setEmail(v);
	const handleFacebookChange = (v: string) => setFacebook(v);
	const handleLinkedinChange = (v: string) => setLinkedin(v);
	const handleSocialHandleChange = (v: string) => setSocialHandle(v);
	const handleSocialSummaryChange = (v: string) => setSocialSummary(v);
	const handleBestTimeChange = (
		v: "morning" | "afternoon" | "evening" | "any",
	) => setBestContactTime(v);

	useEffect(() => {
		let isActive = true;
		setModalCsvFile(csvFile ?? null);
		if (externalCsvHeaders && externalCsvHeaders.length) {
			setCsvHeaders(externalCsvHeaders);
			setSelectedHeadersState((prev) => {
				const autoMapped = autoMapCsvHeaders(externalCsvHeaders, prev);
				setCanProceedFromMapping(areRequiredFieldsMapped(autoMapped));
				setSelectedEnrichmentOptions(
					deriveRecommendedEnrichmentOptions(autoMapped),
				);
				return autoMapped;
			});
		} else {
			setSelectedHeadersState({});
			setCanProceedFromMapping(false);
			setSelectedEnrichmentOptions([]);
		}
		if (csvFile) {
			csvFile
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
		} else {
			setCsvRowCount(0);
		}
		return () => {
			isActive = false;
		};
	}, [csvFile, externalCsvHeaders, deriveRowCount]);

	useEffect(() => {
		if (!isOpen) {
			setSelectedEnrichmentOptions([]);
			setCsvRowCount(0);
			setIsLaunchingSuite(false);
			setCsvContent("");
			resetCostDetails();
		}
	}, [isOpen, resetCostDetails]);

	useEffect(() => {
		if (listMode !== "create") {
			setSelectedEnrichmentOptions([]);
			setCsvRowCount(0);
			setIsLaunchingSuite(false);
			setCsvContent("");
			resetCostDetails();
		}
	}, [listMode, resetCostDetails]);

	useEffect(() => {
		if (!modalCsvFile) {
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

	const handleHeaderSelect = (fieldName: string, value: string) => {
		setSelectedHeadersState((prev: Record<string, string | undefined>) => {
			const next = { ...prev, [fieldName]: value || undefined };
			setCanProceedFromMapping(areRequiredFieldsMapped(next));
			return next;
		});
	};

	// CSV file upload and header extraction (inside modal)
	const handleModalCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.name.endsWith(".csv") && !file.type.includes("csv")) {
			toast.error("Please select a CSV file");
			return;
		}

		setModalCsvFile(file);

		// Parse CSV headers
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
			setSelectedHeadersState((prev) => {
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
		};

		reader.onerror = () => {
			toast.error("Error reading CSV file");
		};

		reader.readAsText(file);
	};

	const triggerModalFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleToggleEnrichmentOption = (optionId: string) => {
		setSelectedEnrichmentOptions((prev) =>
			prev.includes(optionId)
				? prev.filter((id) => id !== optionId)
				: [...prev, optionId],
		);
	};

	const handleLaunchSuite = () => {
		console.log("🚀 handleLaunchSuite called");
		const baseProblems = validateStepNow();
		const combinedProblems: Record<string, string> = { ...baseProblems };

		if (step === 2 && listMode === "create") {
			if (selectedEnrichmentOptions.length === 0) {
				combinedProblems.enrichment =
					"Select at least one enrichment tool to continue.";
			}

			const missingMappings = REQUIRED_FIELD_MAPPING_KEYS.filter(
				(field: string) => !selectedHeadersState[field],
			);
			if (missingMappings.length > 0) {
				combinedProblems.mappings = `Please map required fields: ${missingMappings.join(", ")}`;
			}

			if (!hasEnoughCredits) {
				combinedProblems.credits =
					"Add more skip trace credits or deselect premium tools before launching.";
			}
		}

		setErrors(combinedProblems);

		if (Object.keys(combinedProblems).length !== 0 || isLaunchingSuite) {
			console.log(
				"❌ Launch blocked due to validation errors or active launch",
			);
			return;
		}

		setIsLaunchingSuite(true);
		console.log("⏳ Setting launching state");
		const launchToastId = toast.loading("Launching enrichment suite...");

		if (csvContent && newListName.trim()) {
			console.log("📄 Processing CSV content, length:", csvContent.length);
			console.log("📋 Selected headers:", selectedHeadersState);
			console.log("📝 List name:", newListName);

			try {
				console.log("🔄 Parsing CSV to leads...");
				const leads = parseCsvToLeads(csvContent, selectedHeadersState);
				console.log("✅ Parsed leads:", leads.length);

				const stats = calculateLeadStatistics(leads);
				console.log("📊 Lead statistics:", stats);

				const newLeadList = {
					listName: newListName.trim(),
					leads,
					records: stats.total,
					phone: stats.phone,
					dataLink: modalCsvFile?.name || "uploaded_file.csv",
					socials: stats.socials,
					emails: stats.email,
				};

				console.log("💾 Adding lead list to store...");
				const newLeadListId = addLeadList(newLeadList);
				const launchPayload = newLeadListId
					? {
							leadListId: newLeadListId,
							leadListName: newLeadList.listName,
							leadCount: leads.length,
						}
					: null;

				if (launchPayload) {
					console.log("📨 Launch suite generated lead list", launchPayload);
					const handledBySuiteCallback = Boolean(
						onSuiteLaunchComplete?.(launchPayload),
					);
					if (!handledBySuiteCallback && onLaunchCampaign) {
						launchCampaignIfPossible(launchPayload);
					}

					onClose();
					setIsLaunchingSuite(false);
					setTimeout(() => {
						toast.dismiss(launchToastId);
						toast.success(
							`Skip trace suite launched for ${
								leads.length > 0 ? leads.length.toLocaleString() : "your"
							} leads and saved to lead lists`,
						);
					}, 0);
					return;
				}

				setTimeout(() => {
					setIsLaunchingSuite(false);
					toast.dismiss(launchToastId);
					toast.success(
						`Skip trace suite launched for ${
							leads.length > 0 ? leads.length.toLocaleString() : "your"
						} leads and saved to lead lists`,
					);
					setStep(3);
				}, 1600);
			} catch (error) {
				console.error("❌ Error launching suite:", error);
				setIsLaunchingSuite(false);
				setTimeout(() => {
					toast.dismiss(launchToastId);
					toast.error("Failed to launch enrichment suite. Please try again.");
				}, 0);
			}
		} else {
			console.log("❌ Missing CSV content or list name");
			setTimeout(() => {
				setIsLaunchingSuite(false);
				toast.dismiss(launchToastId);
				toast.success(
					`Skip trace suite launched for ${
						csvRowCount > 0 ? csvRowCount.toLocaleString() : "your"
					} leads`,
				);
				setStep(3);
			}, 1600);
		}
	};

	const handleAddLead = () => {
		const targetList =
			listMode === "create"
				? { mode: "create" as const, name: newListName.trim() }
				: { mode: "select" as const, id: selectedListId };

		const payload = {
			list: targetList,
			lead: {
				firstName,
				lastName,
				address,
				city,
				state: stateValue,
				zipCode,
				phoneNumber,
				isIphone,
				email,
				communication: { preferCall, preferSms },
				socials: { facebook, linkedin, socialHandle, socialSummary },
				// DNC and TCPA fields
				dncList: dncStatus,
				dncSource: dncSource || undefined,
				tcpaOptedIn: tcpaOptedIn,
			},
			skipTrace: {
				selectedTools: selectedEnrichmentOptions,
			},
		};
		console.log("Add lead payload", payload);
		onClose();
	};

	const handleNext = () => {
		if (isLaunchingSuite) return;
		const problems = validateStepNow();
		setErrors(problems);
		if (Object.keys(problems).length !== 0) {
			return;
		}

		if (
			onLaunchCampaign &&
			step === 0 &&
			listMode === "select" &&
			selectedListId
		) {
			const existingList = leadLists.find((list) => list.id === selectedListId);
			const fallbackList = LEAD_LISTS_MOCK.find(
				(list) => list.id === selectedListId,
			);
			const leadListName =
				existingList?.listName ?? fallbackList?.name ?? "Selected Lead List";
			const leadCountValue = existingList?.records ?? 0;
			const launched = launchCampaignIfPossible({
				leadListId: selectedListId,
				leadListName,
				leadCount: leadCountValue,
			});
			if (launched) {
				return;
			}
		}

		if (step === 0 && listMode === "create") {
			// If CSV data already exists (from Quick Start), skip straight to mapping
			if (modalCsvFile && csvHeaders.length > 0) {
				setStep(1);
				return;
			}
			setStep(0.5);
			return;
		}

		if (step === 0.5) {
			// After upload step move into mapping
			setStep(1);
			return;
		}

		if (step === 1 && listMode === "create") {
			if (canProceedFromMapping) {
				setStep(2);
			}
			return;
		}

		if (step === 1 && listMode === "select") {
			setStep(3);
			return;
		}

		if (step === 2 && listMode === "create") {
			// If launching, don't change step - let handleLaunchSuite handle it
			if (isLaunchingSuite) {
				return;
			}
			if (onLaunchCampaign) {
				if (selectedEnrichmentOptions.length === 0) {
					toast.error("Select at least one enrichment tool to continue.");
				}
				return;
			}
			if (selectedEnrichmentOptions.length === 0) {
				setStep(3);
			}
			return;
		}

		setStep((s: number) => Math.min(5, s + 1));
	};

	const handleBack = () => {
		if (isLaunchingSuite) return;
		// Special handling for CSV upload step
		if (step === 0.5) {
			setStep(0);
		} else {
			setStep((s: number) => Math.max(0, s - 1));
		}
	};

	const hasSelectedTools = selectedEnrichmentOptions.length > 0;
	const showLaunchAction =
		step === 2 && listMode === "create" && hasSelectedTools;
	const validationPasses = Object.keys(validateStepNow()).length === 0;
	const canGoNext = (() => {
		if (isLaunchingSuite) {
			return false;
		}
		if (step === 0.5) {
			return csvHeaders.length > 0;
		}
		if (step === 1 && listMode === "create") {
			return canProceedFromMapping;
		}
		if (step === 2 && listMode === "create") {
			return showLaunchAction
				? hasEnoughCredits && validationPasses
				: validationPasses;
		}
		return validationPasses;
	})();

	const primaryActionLabel = (() => {
		if (showLaunchAction) {
			if (!hasEnoughCredits && costDetails.estimatedCredits > 0) {
				return "Add Credits";
			}
			return isLaunchingSuite ? "Launching..." : "Launch Suite";
		}
		if (step === 5) {
			return "Add Lead";
		}
		return "Next";
	})();

	const handlePrimaryAction = () => {
		console.log("🎯 handlePrimaryAction called");
		console.log("Step:", step, "List mode:", listMode);
		console.log("Has enough credits:", hasEnoughCredits);
		console.log("Show launch action:", showLaunchAction);

		if (showLaunchAction) {
			console.log("🚀 Launch action triggered");
			if (!hasEnoughCredits) {
				console.log("❌ Not enough credits");
				toast.error(
					"Not enough skip trace credits to launch. Add credits to continue.",
				);
				return;
			}
			console.log("✅ Credits OK, calling handleLaunchSuite");
			handleLaunchSuite();
			return;
		}
		if (step === 5) {
			handleAddLead();
			return;
		}
		handleNext();
	};

	const buttonClass =
		"px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50";
	const navClass = "mt-6 flex items-center justify-between";

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
						<LeadListSelectStep
							mode={listMode}
							onModeChange={setListMode}
							listName={newListName}
							onListNameChange={setNewListName}
							selectedListId={selectedListId}
							onSelectedListIdChange={setSelectedListId}
							existingLists={combinedExistingLists}
							bestContactTime={bestContactTime}
							onBestContactTimeChange={handleBestTimeChange}
							listNotes={listNotes}
							onListNotesChange={setListNotes}
							showBestTime={false}
							showNotes={false}
							errors={errors}
						/>
					)}

					{/* CSV Upload Step - only for create mode */}
					{step === 0.5 && listMode === "create" && (
						<div className="space-y-4">
							<div className="text-center">
								<h3 className="text-lg font-semibold text-foreground mb-2">
									Upload CSV File
								</h3>
								<p className="text-muted-foreground text-sm mb-4">
									Upload a CSV file to map columns to lead fields
								</p>
							</div>

							<div className="flex flex-col items-center space-y-4">
								<Button
									variant="outline"
									size="lg"
									onClick={triggerModalFileInput}
									className="w-full max-w-sm"
								>
									<Upload className="w-4 h-4 mr-2" />
									{modalCsvFile ? "Change CSV File" : "Upload CSV File"}
								</Button>
								<Button
									variant="ghost"
									size="lg"
									onClick={() => downloadLeadCsvTemplate()}
									className="w-full max-w-sm"
								>
									<Download className="w-4 h-4 mr-2" />
									Download Sample CSV
								</Button>

								{modalCsvFile && (
									<div className="text-sm text-muted-foreground text-center">
										<p className="font-medium">{modalCsvFile.name}</p>
										<p className="text-xs">
											{csvHeaders.length} columns detected
										</p>
									</div>
								)}

								<input
									ref={fileInputRef}
									type="file"
									accept=".csv,text/csv"
									onChange={handleModalCsvUpload}
									className="hidden"
								/>
							</div>

							{modalCsvFile && csvHeaders.length > 0 && (
								<div className="text-center">
									<Button
										size="lg"
										onClick={() => setStep(1)}
										className="w-full max-w-sm"
									>
										Continue to Field Mapping
									</Button>
								</div>
							)}
						</div>
					)}

					{step === 1 && listMode === "create" && (
						<FieldMappingStep
							headers={csvHeaders}
							selectedHeaders={selectedHeadersState}
							onHeaderSelect={handleHeaderSelect}
							errors={{}}
							onCanProceedChange={setCanProceedFromMapping}
						/>
					)}

					{step === 2 && listMode === "create" && (
						<SkipTraceSummaryStep
							selectedHeaders={selectedHeadersState}
							selectedOptions={selectedEnrichmentOptions}
							onToggleOption={handleToggleEnrichmentOption}
							leadCount={csvRowCount}
							onCostDetailsChange={handleCostDetailsChange}
							isLaunching={isLaunchingSuite}
						/>
					)}

					{step === 1 && listMode === "select" && (
						<LeadBasicInfoStep
							firstName={firstName}
							lastName={lastName}
							onFirstNameChange={handleFirstNameChange}
							onLastNameChange={handleLastNameChange}
							errors={errors}
						/>
					)}

					{step === 3 && (
						<LeadAddressStep
							address={address}
							city={city}
							state={stateValue}
							zipCode={zipCode}
							onAddressChange={handleAddressChange}
							onCityChange={handleCityChange}
							onStateChange={handleStateChange}
							onZipCodeChange={handleZipCodeChange}
							errors={errors}
						/>
					)}

					{step === 4 && (
						<LeadContactStep
							phoneNumber={phoneNumber}
							email={email}
							isIphone={isIphone}
							preferCall={preferCall}
							preferSms={preferSms}
							bestContactTime={bestContactTime}
							onPhoneNumberChange={handlePhoneNumberChange}
							onEmailChange={handleEmailChange}
							onIsIphoneChange={setIsIphone}
							onPreferCallChange={setPreferCall}
							onPreferSmsChange={setPreferSms}
							onBestContactTimeChange={handleBestTimeChange}
							leadNotes={leadNotes}
							onLeadNotesChange={setLeadNotes}
							showBestTime={false}
							showLeadNotes={false}
							errors={errors}
						/>
					)}

					{step === 5 && (
						<LeadSocialsStep
							facebook={facebook}
							linkedin={linkedin}
							socialHandle={socialHandle}
							socialSummary={socialSummary}
							onFacebookChange={handleFacebookChange}
							onLinkedinChange={handleLinkedinChange}
							onSocialHandleChange={handleSocialHandleChange}
							onSocialSummaryChange={handleSocialSummaryChange}
							errors={errors}
						/>
					)}

					{errors.socials && step === 4 && (
						<p className="mt-2 text-destructive text-sm">{errors.socials}</p>
					)}

					<div className={navClass}>
						{step !== 0 && step !== 0.5 && (
							<button
								type="button"
								className={buttonClass}
								onClick={handleBack}
								disabled={isLaunchingSuite}
							>
								Back
							</button>
						)}
						<button
							type="button"
							className={buttonClass}
							onClick={handlePrimaryAction}
							disabled={!canGoNext}
						>
							{primaryActionLabel}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default LeadMainModal;
