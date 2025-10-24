"use client";

import { type ChangeEvent, useRef } from "react";
import { Database, PlugZap, Search, Upload } from "lucide-react";
import { shallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	type LeadSourceOption,
	useQuickStartWizardDataStore,
} from "@/lib/stores/quickstartWizardData";

const INTEGRATION_OPTIONS = [
	"DealScale CRM",
	"Salesforce",
	"HubSpot",
	"Google Sheets",
] as const;

const SOURCE_ITEMS: Array<{
	readonly value: LeadSourceOption;
	readonly title: string;
	readonly description: string;
	readonly icon: typeof Upload;
}> = [
	{
		value: "csv-upload",
		title: "Upload CSV",
		description: "Bulk import fresh leads or lists with instant deduplication.",
		icon: Upload,
	},
	{
		value: "saved-search",
		title: "Saved Search",
		description:
			"Resume a DealScale saved search and sync results automatically.",
		icon: Search,
	},
	{
		value: "integrations",
		title: "Connected Source",
		description: "Pull data from CRM, sheets, or marketplace integrations.",
		icon: PlugZap,
	},
];

const LeadSourceSelector = () => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const {
		leadSource,
		setLeadSource,
		csvFileName,
		csvRecordEstimate,
		setCsvDetails,
		selectedIntegrations,
		toggleIntegrationSource,
		savedSearchName,
		setSavedSearchName,
	} = useQuickStartWizardDataStore(
		(state) => ({
			leadSource: state.leadSource,
			setLeadSource: state.setLeadSource,
			csvFileName: state.csvFileName,
			csvRecordEstimate: state.csvRecordEstimate,
			setCsvDetails: state.setCsvDetails,
			selectedIntegrations: state.selectedIntegrations,
			toggleIntegrationSource: state.toggleIntegrationSource,
			savedSearchName: state.savedSearchName,
			setSavedSearchName: state.setSavedSearchName,
		}),
		shallow,
	);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const [file] = Array.from(event.target.files ?? []);
		if (!file) {
			setCsvDetails({ fileName: null, recordEstimate: null });
			return;
		}

		const estimatedRecords = Math.max(50, Math.round(file.size / 150));
		setCsvDetails({ fileName: file.name, recordEstimate: estimatedRecords });
	};

	return (
		<Card>
			<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<CardTitle className="text-xl">Choose Your Lead Source</CardTitle>
					<CardDescription>
						Select how you’d like to seed the QuickStart wizard with contacts.
					</CardDescription>
				</div>
				<Database className="hidden h-10 w-10 text-primary sm:block" />
			</CardHeader>
			<CardContent className="space-y-4">
				<RadioGroup
					value={leadSource}
					onValueChange={(value) => setLeadSource(value as LeadSourceOption)}
					className="grid gap-3 md:grid-cols-3"
				>
					{SOURCE_ITEMS.map(({ value, title, description, icon: Icon }) => (
						<Label
							key={value}
							htmlFor={`lead-source-${value}`}
							className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 shadow-sm transition hover:border-primary"
						>
							<RadioGroupItem
								id={`lead-source-${value}`}
								value={value}
								className="mt-1"
							/>
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<Icon className="h-4 w-4 text-primary" />
									<p className="font-semibold text-sm">{title}</p>
								</div>
								<p className="text-muted-foreground text-xs leading-relaxed">
									{description}
								</p>
							</div>
						</Label>
					))}
				</RadioGroup>

				{leadSource === "csv-upload" && (
					<div className="rounded-lg border bg-muted/30 p-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="font-medium text-sm">Upload a CSV list</p>
								<p className="text-muted-foreground text-xs">
									We’ll validate headers, dedupe, and surface skip-trace
									coverage.
								</p>
							</div>
							<div className="flex items-center gap-2">
								<input
									ref={fileInputRef}
									type="file"
									accept=".csv,text/csv"
									onChange={handleFileChange}
									className="hidden"
								/>
								<Button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									variant="outline"
								>
									<Upload className="mr-2 h-4 w-4" />
									Upload CSV
								</Button>
								{csvFileName && (
									<Button
										type="button"
										variant="ghost"
										onClick={() =>
											setCsvDetails({
												fileName: null,
												recordEstimate: null,
											})
										}
									>
										Clear
									</Button>
								)}
							</div>
						</div>
						{csvFileName && (
							<div className="mt-3 rounded-md border bg-background p-3 text-xs">
								<p className="font-medium">{csvFileName}</p>
								<p className="text-muted-foreground">
									Estimated records: {csvRecordEstimate ?? "—"}
								</p>
							</div>
						)}
					</div>
				)}

				{leadSource === "saved-search" && (
					<div className="rounded-lg border bg-muted/30 p-4">
						<Label htmlFor="saved-search-name" className="text-sm font-medium">
							Which saved search should we hydrate?
						</Label>
						<Input
							id="saved-search-name"
							placeholder="e.g. Phoenix absentee owners"
							value={savedSearchName}
							onChange={(event) => setSavedSearchName(event.target.value)}
							className="mt-2"
						/>
						<p className="mt-1 text-muted-foreground text-xs">
							We’ll sync the latest results and keep the segment warm.
						</p>
					</div>
				)}

				{leadSource === "integrations" && (
					<div className="rounded-lg border bg-muted/30 p-4 space-y-3">
						<p className="font-medium text-sm">
							Select any connected integrations to hydrate this journey.
						</p>
						<div className="grid gap-2 sm:grid-cols-2">
							{INTEGRATION_OPTIONS.map((integration) => (
								<Label
									key={integration}
									className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm shadow-sm hover:border-primary"
								>
									<Checkbox
										checked={selectedIntegrations.includes(integration)}
										onCheckedChange={() => toggleIntegrationSource(integration)}
									/>
									{integration}
								</Label>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default LeadSourceSelector;
