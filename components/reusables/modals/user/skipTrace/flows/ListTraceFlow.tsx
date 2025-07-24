"use client";

import type React from "react";
import { useEffect } from "react";
import Papa from "papaparse";
import { useSkipTraceStore } from "@/lib/stores/user/skipTraceStore";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import { EnrichmentStep } from "../steps/EnrichmentStep";
import MapHeadersStep from "../steps/MapHeadersStep";
import ReviewAndSubmitStep from "../steps/ReviewAndSubmitStep";
import UploadStep from "../steps/UploadStep";

interface ListTraceFlowProps {
	onClose: () => void;
	onBack: () => void;
	initialFile?: File;
}

const ListTraceFlow: React.FC<ListTraceFlowProps> = ({
	onClose,
	onBack,
	initialFile,
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
	} = useSkipTraceStore();

	const { userProfile } = useUserProfileStore();

	const availableCredits = userProfile?.subscription?.aiCredits
		? userProfile.subscription.aiCredits.allotted -
			userProfile.subscription.aiCredits.used
		: 0;

	useEffect(() => {
		if (initialFile) {
			Papa.parse(initialFile, {
				header: true,
				skipEmptyLines: true,
				complete: (results) => {
					if (results.meta.fields) {
						handleFileSelect(
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
			reset();
		};
	}, [initialFile, handleFileSelect, reset]);

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
		switch (step) {
			case 0:
				return <UploadStep onFileSelect={handleFileSelect} onBack={onBack} />;
			case 1:
				return (
					<MapHeadersStep
						headers={parsedHeaders}
						onSubmit={handleHeaderSelection}
						onBack={prevStep}
					/>
				);
			case 2:
				return (
					<EnrichmentStep onNext={handleEnrichmentNext} onBack={prevStep} />
				);
			case 3:
				return (
					<ReviewAndSubmitStep
						onSubmit={handleSubmit}
						onBack={prevStep}
						availableCredits={availableCredits}
					/>
				);
			default:
				return null;
		}
	};

	return <div className="flex-1 overflow-y-auto">{renderStep()}</div>;
};

export default ListTraceFlow;
