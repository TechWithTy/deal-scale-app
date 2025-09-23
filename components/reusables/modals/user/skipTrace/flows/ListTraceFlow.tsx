"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { useSkipTraceStore } from "@/lib/stores/user/skip_trace/skipTraceStore";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { EnrichmentStep } from "../steps/EnrichmentStep";
import MapHeadersStep from "../steps/MapHeadersStep";
import UploadStep from "../steps/UploadStep";
import type { InputField } from "@/types/skip-trace/enrichment";
import { fieldLabels } from "@/constants/skip-trace/fieldLabels";

interface ListTraceFlowProps {
	onClose: () => void;
	onBack: () => void;
	initialFile?: File;
	availableListNames?: string[];
	availableFields?: string[];
	availableLeadCount?: number;
	listCounts?: Record<string, number>;
	availableLists?: { name: string; count: number }[];
	initialListMode?: "select" | "create";
}

const ListTraceFlow: React.FC<ListTraceFlowProps> = ({
	onClose,
	onBack,
	initialFile,
	availableListNames,
	availableFields,
	availableLeadCount,
	listCounts,
	availableLists,
	initialListMode,
}) => {
	const {
		step,
		listName,
		uploadedFile,
		parsedHeaders,
		selectedHeaders,
		selectedEnrichmentOptions,
		userInput,
		leadCount,
		submitting,
		handleFileSelect,
		handleHeaderSelection,
		handleEnrichmentNext,
		setSubmitting,
		prevStep,
		reset,
		nextStep,
	} = useSkipTraceStore();

	const [selectedFields, setSelectedFields] = useState<Set<InputField>>(
		new Set(),
	);
	// Selection mode: create a new list or select existing lists
	const [listMode, setListMode] = useState<"select" | "create">("select");
	const [newListName, setNewListName] = useState("");
	const newListNameRef = useRef<HTMLInputElement | null>(null);

	const { userProfile } = useUserProfileStore();

	const availableCredits = userProfile?.subscription?.aiCredits
		? userProfile.subscription.aiCredits.allotted -
			userProfile.subscription.aiCredits.used
		: 0;

	// Compute effective list names from any provided source
	const effectiveListNames = useMemo(() => {
		if (availableListNames && availableListNames.length > 0)
			return availableListNames;
		if (availableLists && availableLists.length > 0)
			return availableLists.map((l) => l.name);
		const keys = Object.keys(listCounts ?? {});
		return keys.length > 0 ? keys : [];
	}, [availableListNames, availableLists, listCounts]);

	// When lists come from table selection, we use an alternate flow:
	const hasIncomingLists = effectiveListNames.length > 0;
	const [selectedListNames, setSelectedListNames] = useState<string[]>(
		() =>
			availableListNames ??
			availableLists?.map((l) => l.name) ??
			Object.keys(listCounts ?? {}),
	);

	// Auto-select any incoming lists by default (only if nothing selected yet)
	useEffect(() => {
		if (
			hasIncomingLists &&
			selectedListNames.length === 0 &&
			effectiveListNames.length > 0
		) {
			setSelectedListNames(effectiveListNames);
		}
	}, [hasIncomingLists, effectiveListNames, selectedListNames.length]);

	// Remove the requirement of selecting a list to begin: auto-advance to the next step
	useEffect(() => {
		if (hasIncomingLists && step === 0) {
			nextStep();
		}
	}, [hasIncomingLists, step, nextStep]);

	// Default list mode: prefer prop, else based on whether lists are present
	useEffect(() => {
		if (initialListMode) {
			setListMode(initialListMode);
			return;
		}
		setListMode(hasIncomingLists ? "select" : "create");
	}, [initialListMode, hasIncomingLists]);

	// When switching to create mode, focus the input automatically
	useEffect(() => {
		if (listMode === "create") {
			newListNameRef.current?.focus();
		}
	}, [listMode]);

	// Stabilize store function references to avoid effect loops when store returns new identities
	const handleFileSelectRef = useRef(handleFileSelect);
	const resetRef = useRef(reset);
	useEffect(() => {
		handleFileSelectRef.current = handleFileSelect;
		resetRef.current = reset;
	}, [handleFileSelect, reset]);

	useEffect(() => {
		if (initialFile) {
			Papa.parse(initialFile, {
				header: true,
				skipEmptyLines: true,
				complete: (results) => {
					if (results.meta.fields) {
						handleFileSelectRef.current(
							initialFile,
							results.meta.fields,
							initialFile.name.replace(/\.csv$/, ""),
							results.data as Record<string, unknown>[],
						);
					}
				},
			});
		}

		return () => {
			resetRef.current();
		};
		// Only depend on the actual input we parse; handler refs are kept up-to-date separately
	}, [initialFile]);

	// Compute effective lead count based on selected lists and provided listCounts
	const selectedLeadCount = useMemo(() => {
		// Prefer availableLists array (source of truth), fallback to listCounts map, then availableLeadCount
		if (availableLists && selectedListNames.length > 0) {
			return selectedListNames.reduce((sum, name) => {
				const item = availableLists.find((l) => l.name === name);
				return sum + (item?.count ?? 0);
			}, 0);
		}
		if (listCounts && selectedListNames.length > 0) {
			return selectedListNames.reduce(
				(sum, name) => sum + (listCounts[name] ?? 0),
				0,
			);
		}
		return typeof availableLeadCount === "number" ? availableLeadCount : 0;
	}, [availableLists, listCounts, selectedListNames, availableLeadCount]);

	const handleSubmit = async () => {
		setSubmitting(true);
		console.log("Submitting List:", {
			listName,
			uploadedFile,
			selectedHeaders,
			selectedEnrichmentOptions,
			userInput,
		});
		await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
		setSubmitting(false);
		onClose();
	};

	const renderStep = () => {
		if (hasIncomingLists) {
			// Alternate flow (table-selected lists)
			// Now the selection UI is shown on the next step (step === 1)
			if (step === 1) {
				return (
					<div className="space-y-4 p-4">
						<h3 className="font-medium text-lg">Choose Lead Lists</h3>
						<p className="text-muted-foreground text-sm">
							You'll run Skip Trace for the following list
							{effectiveListNames && effectiveListNames.length > 1 ? "s" : ""}:
						</p>
						<div className="space-y-4">
							<div className="flex items-center gap-4 text-sm">
								<label className="flex items-center gap-2">
									<input
										type="radio"
										checked={listMode === "select"}
										onChange={() => {
											setListMode("select");
											// When switching to select mode, if nothing picked yet, prefill with all
											if (
												selectedListNames.length === 0 &&
												effectiveListNames.length > 0
											) {
												setSelectedListNames(effectiveListNames);
											}
										}}
									/>
									Select existing list(s)
								</label>
								<label className="flex items-center gap-2">
									<input
										type="radio"
										checked={listMode === "create"}
										onChange={() => setListMode("create")}
									/>
									Create new list
								</label>
							</div>

							{listMode === "create" ? (
								<div className="space-y-2">
									<label htmlFor="newListName" className="text-sm">
										New list name
									</label>
									<input
										id="newListName"
										type="text"
										className="w-full rounded-md border px-3 py-2 text-sm"
										value={newListName}
										onChange={(e) => setNewListName(e.target.value)}
										ref={newListNameRef}
									/>
								</div>
							) : (
								<div className="space-y-2">
									<p id="listMultiBoxLabel" className="text-sm">
										Select one or more lists
									</p>
									<select
										id="listMultiBox"
										aria-labelledby="listMultiBoxLabel"
										multiple
										value={selectedListNames}
										onChange={(e) => {
											// Convert selectedOptions to an array of values
											const options = Array.from(
												e.target.selectedOptions,
												(option) => option.value,
											);
											setSelectedListNames(options);
										}}
										className="max-h-56 w-full overflow-auto rounded-md border text-sm"
									>
										{(effectiveListNames ?? []).map((name) => {
											const count =
												availableLists?.find((l) => l.name === name)?.count ??
												listCounts?.[name] ??
												0;
											return (
												<option key={name} value={name}>
													{name} ({count})
												</option>
											);
										})}
									</select>
								</div>
							)}
						</div>
						<div className="pt-2 text-right text-muted-foreground text-xs">
							Total selected leads:{" "}
							<span className="font-medium text-foreground">
								{selectedLeadCount.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between pt-4">
							<button
								type="button"
								className="rounded-md border px-3 py-2"
								onClick={prevStep}
							>
								Back
							</button>
							<button
								type="button"
								className="rounded-md bg-primary px-3 py-2 text-primary-foreground"
								onClick={() => {
									console.log("Selected lists:", selectedListNames);
									console.log("Selected lead count:", selectedLeadCount);
									const provided = (availableFields ?? []).filter(
										(f): f is InputField =>
											(fieldLabels as Record<string, string | undefined>)[f] !==
											undefined,
									);
									setSelectedFields(
										new Set(
											provided.length
												? provided
												: (Object.keys(fieldLabels).filter(
														(f) =>
															(
																fieldLabels as Record<
																	string,
																	string | undefined
																>
															)[f] !== undefined,
													) as InputField[]),
										),
									);
									nextStep();
								}}
								// Allow proceeding without preselecting; user can adjust later
								disabled={false}
							>
								Next
							</button>
						</div>
					</div>
				);
			}

			// step !== 1
			return (
				<EnrichmentStep
					onNext={handleEnrichmentNext}
					onBack={prevStep}
					mappedTypesOverride={selectedFields}
					leadCountOverride={selectedLeadCount}
				/>
			);
		}

		// Default flow (file upload)
		if (step === 0) {
			return <UploadStep onFileSelect={handleFileSelect} onBack={onBack} />;
		}

		if (step === 1) {
			return (
				<MapHeadersStep
					headers={parsedHeaders}
					onSubmit={handleHeaderSelection}
					onBack={prevStep}
				/>
			);
		}

		// step > 1
		return (
			<EnrichmentStep
				onNext={handleEnrichmentNext}
				onBack={prevStep}
				leadCountOverride={leadCount}
			/>
		);
	};

	return <div className="flex-1 overflow-y-auto">{renderStep()}</div>;
};

export default ListTraceFlow;
