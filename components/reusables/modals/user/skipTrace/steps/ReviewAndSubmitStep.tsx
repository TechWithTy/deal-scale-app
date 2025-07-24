"use client";

import { enrichmentOptions } from "@/constants/skip-trace/enrichmentOptions";
import type { Header } from "@/types/skip-trace";
import type { InputField } from "@/types/skip-trace/enrichment";
import { fieldLabels } from "@/constants/skip-trace/fieldLabels";
import type React from "react";
import { useSkipTraceStore } from "@/lib/stores/user/skipTraceStore";

interface ReviewAndSubmitStepProps {
	onSubmit: () => void;
	onBack: () => void;
	availableCredits: number;
}

const ReviewAndSubmitStep: React.FC<ReviewAndSubmitStepProps> = ({
	onSubmit,
	onBack,
	availableCredits,
}) => {
	const {
		listName,
		uploadedFile,
		selectedHeaders,
		submitting,
		selectedEnrichmentOptions,
		leadCount,
		userInput,
	} = useSkipTraceStore();

	const selectedOptionsDetails = enrichmentOptions.filter((opt) =>
		selectedEnrichmentOptions.includes(opt.id),
	);

	const premiumEnrichments = selectedOptionsDetails.filter(
		(opt) => !opt.isFree,
	);
	const costPerLead = premiumEnrichments.length;
	const totalCost = leadCount * costPerLead;

	const remainingCredits = availableCredits - totalCost;
	return (
		<div className="space-y-4 p-4">
			<h3 className="font-medium text-lg">Review and Submit</h3>
			<div className="space-y-2 rounded-md border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-900/50">
				<div className="grid grid-cols-3 gap-4 text-sm">
					<div>
						<p className="text-gray-600 dark:text-gray-400">Available</p>
						<p className="font-bold text-blue-800 dark:text-blue-200">
							{availableCredits.toLocaleString()}
						</p>
					</div>
					<div>
						<p className="text-gray-600 dark:text-gray-400">Cost</p>
						<p className="font-bold text-red-600 dark:text-red-400">
							- {totalCost.toLocaleString()}
						</p>
					</div>
					<div>
						<p className="text-gray-600 dark:text-gray-400">Remaining</p>
						<p className="font-bold text-green-600 dark:text-green-400">
							{remainingCredits.toLocaleString()}
						</p>
					</div>
				</div>
			</div>
			<div className="space-y-3 rounded-md border p-4 dark:border-gray-700">
				{uploadedFile ? (
					<>
						<div>
							<span className="font-semibold">List Name:</span> {listName}
						</div>
						<div>
							<span className="font-semibold">File:</span> {uploadedFile.name}
						</div>
						<div>
							<h4 className="font-semibold">Mapped Headers:</h4>
							<ul className="list-inside list-disc pl-4">
								{selectedHeaders.map((h) => (
									<li key={h.csvHeader}>
										{h.csvHeader} &rarr; {h.type.replace(/_/g, " ")}
									</li>
								))}
							</ul>
						</div>
					</>
				) : (
					<div>
						<h4 className="font-semibold">Contact Details:</h4>
						<ul className="list-inside list-disc pl-4">
							{userInput &&
								Object.entries(userInput)
									.filter(([, value]) => value)
									.map(([key, value]) => (
										<li key={key}>
											<span className="font-semibold">
												{fieldLabels[key as InputField] || key}:
											</span>{" "}
											{value}
										</li>
									))}
						</ul>
					</div>
				)}

				{selectedOptionsDetails.length > 0 && (
					<div>
						<h4 className="font-semibold">Selected Enrichments:</h4>
						<ul className="list-inside list-disc pl-4">
							{selectedOptionsDetails.map((opt) => (
								<li key={opt.id}>{opt.title}</li>
							))}
						</ul>
					</div>
				)}
			</div>
			<div className="flex justify-between">
				<button
					type="button"
					onClick={onBack}
					className="rounded-md border bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
				>
					Back
				</button>
				<button
					type="button"
					onClick={onSubmit}
					disabled={submitting}
					className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{submitting ? "Submitting..." : "Submit"}
				</button>
			</div>
		</div>
	);
};

export default ReviewAndSubmitStep;
