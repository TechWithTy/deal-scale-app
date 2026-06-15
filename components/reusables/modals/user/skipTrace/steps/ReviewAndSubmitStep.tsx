"use client";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { enrichmentOptions } from "@/constants/skip-trace/enrichmentOptions";
import { fieldLabels } from "@/constants/skip-trace/fieldLabels";
import { useSkipTraceStore } from "@/lib/stores/user/skip_trace/skipTraceStore";
import type { Header } from "@/types/skip-trace";
import type { InputField } from "@/types/skip-trace/enrichment";
import type React from "react";

type BestContactTime = "morning" | "afternoon" | "evening" | "any";

interface ReviewAndSubmitStepProps {
	onSubmit: () => void;
	onBack: () => void;
	availableCredits: number;
	bestContactTime: BestContactTime;
	onBestContactTimeChange: (value: BestContactTime) => void;
	contactNotes: string;
	onContactNotesChange: (value: string) => void;
	skipExistingContacts?: boolean;
}

const ReviewAndSubmitStep: React.FC<ReviewAndSubmitStepProps> = ({
	onSubmit,
	onBack,
	availableCredits,
	bestContactTime,
	onBestContactTimeChange,
	contactNotes,
	onContactNotesChange,
	skipExistingContacts = true,
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
		<div className="flex max-h-[calc(90vh-3rem)] min-h-0 flex-col">
			<div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
				<h3 className="font-medium text-lg">Review and Submit</h3>
				<div className="space-y-2 rounded-md border border-primary/20 bg-primary/10 p-4 text-center">
					<div className="grid grid-cols-3 gap-4 text-sm">
						<div>
							<p className="text-muted-foreground">Available</p>
							<p className="font-bold text-primary">
								{availableCredits.toLocaleString()}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground">Cost</p>
							<p className="font-bold text-destructive">
								- {totalCost.toLocaleString()}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground">Remaining</p>
							<p className="font-bold text-green-600 dark:text-green-400">
								{remainingCredits.toLocaleString()}
							</p>
						</div>
					</div>
				</div>
				<div className="space-y-3 rounded-md border border-border p-4">
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
					<div>
						<h4 className="font-semibold">Duplicate Handling</h4>
						<p className="text-muted-foreground text-sm">
							{skipExistingContacts
								? "Existing duplicate contacts in the selected list will be skipped."
								: "Duplicate contacts may be reprocessed."}
						</p>
					</div>
					<h4 className="font-semibold">Contact Preferences</h4>
					<div className="space-y-2">
						<Label htmlFor="bestTimeReview">Best Time to Contact</Label>
						<Select
							value={bestContactTime}
							onValueChange={(v) =>
								onBestContactTimeChange(v as BestContactTime)
							}
						>
							<SelectTrigger id="bestTimeReview">
								<SelectValue placeholder="Select best time" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="any">Any</SelectItem>
								<SelectItem value="morning">Morning</SelectItem>
								<SelectItem value="afternoon">Afternoon</SelectItem>
								<SelectItem value="evening">Evening</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="contactNotes">Contact Notes</Label>
						<textarea
							id="contactNotes"
							className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
							rows={3}
							value={contactNotes}
							onChange={(e) => onContactNotesChange(e.target.value)}
							placeholder="Notes about this lead for contacting"
						/>
					</div>
				</div>
			</div>
			<div className="sticky bottom-0 flex justify-between gap-3 border-border border-t bg-card p-4">
				<button
					type="button"
					onClick={onBack}
					className="rounded-md border bg-card px-4 py-2 font-medium text-card-foreground hover:bg-muted"
				>
					Back
				</button>
				<button
					type="button"
					onClick={onSubmit}
					disabled={submitting}
					className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{submitting ? "Processing..." : "Process Enrichment"}
				</button>
			</div>
		</div>
	);
};

export default ReviewAndSubmitStep;
