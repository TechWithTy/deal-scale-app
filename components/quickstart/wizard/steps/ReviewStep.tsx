"use client";

import { CheckCircle } from "lucide-react";
import { useMemo } from "react";
import { shallow } from "zustand/shallow";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCampaignCreationStore } from "@/lib/stores/campaignCreation";
import { useQuickStartWizardDataStore } from "@/lib/stores/quickstartWizardData";

const ReviewStep = () => {
	const {
		leadSource,
		csvFileName,
		csvRecordEstimate,
		targetMarkets,
		selectedIntegrations,
		savedSearchName,
		leadNotes,
		marketFilters,
		budgetRange,
		timeline,
		marketNotes,
		reviewNotes,
		setReviewNotes,
	} = useQuickStartWizardDataStore(
		(state) => ({
			leadSource: state.leadSource,
			csvFileName: state.csvFileName,
			csvRecordEstimate: state.csvRecordEstimate,
			targetMarkets: state.targetMarkets,
			selectedIntegrations: state.selectedIntegrations,
			savedSearchName: state.savedSearchName,
			leadNotes: state.leadNotes,
			marketFilters: state.marketFilters,
			budgetRange: state.budgetRange,
			timeline: state.timeline,
			marketNotes: state.marketNotes,
			reviewNotes: state.reviewNotes,
			setReviewNotes: state.setReviewNotes,
		}),
		shallow,
	);

	const {
		campaignName,
		primaryChannel,
		selectedAgentId,
		availableAgents,
		selectedWorkflowId,
		availableWorkflows,
		selectedSalesScriptId,
		availableSalesScripts,
	} = useCampaignCreationStore(
		(state) => ({
			campaignName: state.campaignName,
			primaryChannel: state.primaryChannel,
			selectedAgentId: state.selectedAgentId,
			availableAgents: state.availableAgents,
			selectedWorkflowId: state.selectedWorkflowId,
			availableWorkflows: state.availableWorkflows,
			selectedSalesScriptId: state.selectedSalesScriptId,
			availableSalesScripts: state.availableSalesScripts,
		}),
		shallow,
	);

	const formatCurrency = useMemo(
		() =>
			new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
				maximumFractionDigits: 0,
			}).format,
		[],
	);

	const agentLabel = useMemo(
		() =>
			availableAgents.find((agent) => agent.id === selectedAgentId)?.name ??
			"Unassigned",
		[availableAgents, selectedAgentId],
	);

	const workflowLabel = useMemo(
		() =>
			availableWorkflows.find((workflow) => workflow.id === selectedWorkflowId)
				?.name ?? "Not selected",
		[availableWorkflows, selectedWorkflowId],
	);

	const salesScriptLabel = useMemo(
		() =>
			availableSalesScripts.find(
				(script) => script.id === selectedSalesScriptId,
			)?.name ?? "Default",
		[availableSalesScripts, selectedSalesScriptId],
	);

	return (
		<div data-testid="review-step" className="space-y-6">
			<Card>
				<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<CardTitle className="text-xl">Intake Summary</CardTitle>
						<CardDescription>
							Confirm the source, segmentation, and enrichment notes before
							moving on.
						</CardDescription>
					</div>
					<CheckCircle className="hidden h-10 w-10 text-primary sm:block" />
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="rounded-lg border p-4 text-sm">
						<p className="font-medium">Lead source</p>
						<p className="text-muted-foreground text-xs capitalize">
							{leadSource}
						</p>
						{leadSource === "csv-upload" && (
							<p className="mt-2 text-xs">
								{csvFileName ?? "No file selected"}
								{csvRecordEstimate
									? ` • ~${csvRecordEstimate.toLocaleString()} records`
									: ""}
							</p>
						)}
						{leadSource === "saved-search" && savedSearchName && (
							<p className="mt-2 text-xs">Saved search: {savedSearchName}</p>
						)}
						{leadSource === "integrations" &&
							selectedIntegrations.length > 0 && (
								<p className="mt-2 text-xs">
									Integrations: {selectedIntegrations.join(", ")}
								</p>
							)}
					</div>
					<div className="rounded-lg border p-4 text-sm">
						<p className="font-medium">Target markets</p>
						<div className="mt-2 flex flex-wrap gap-2">
							{targetMarkets.map((market) => (
								<Badge key={market} variant="secondary">
									{market}
								</Badge>
							))}
							{targetMarkets.length === 0 && (
								<span className="text-muted-foreground text-xs">
									No markets specified
								</span>
							)}
						</div>
						{marketFilters.length > 0 && (
							<p className="mt-2 text-muted-foreground text-xs">
								Filters: {marketFilters.join(", ")}
							</p>
						)}
					</div>
					<div className="rounded-lg border p-4 text-sm">
						<p className="font-medium">Budget & timeline</p>
						<p className="text-muted-foreground text-xs">
							{formatCurrency(budgetRange[0])} -{" "}
							{formatCurrency(budgetRange[1])}
						</p>
						<p className="mt-1 text-muted-foreground text-xs">
							Timeline: {timeline}
						</p>
					</div>
					<div className="rounded-lg border p-4 text-sm">
						<p className="font-medium">Notes</p>
						<p className="text-muted-foreground text-xs leading-relaxed">
							{leadNotes || marketNotes
								? `${leadNotes}${leadNotes && marketNotes ? " • " : ""}${marketNotes}`
								: "No additional notes"}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Campaign Details</CardTitle>
					<CardDescription>
						Review owner assignments, workflow automation, and scripting
						selections.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-3">
					<div className="rounded-lg border p-4 text-sm">
						<p className="font-medium">Campaign name</p>
						<p className="text-muted-foreground text-xs">
							{campaignName || "Untitled campaign"}
						</p>
					</div>
					<div className="rounded-lg border p-4 text-sm">
						<p className="font-medium">Primary channel</p>
						<p className="text-muted-foreground text-xs">
							{primaryChannel ?? "Not selected"}
						</p>
					</div>
					<div className="rounded-lg border p-4 text-sm">
						<p className="font-medium">Assigned agent</p>
						<p className="text-muted-foreground text-xs">{agentLabel}</p>
					</div>
					<div className="rounded-lg border p-4 text-sm">
						<p className="font-medium">Workflow</p>
						<p className="text-muted-foreground text-xs">{workflowLabel}</p>
					</div>
					<div className="rounded-lg border p-4 text-sm">
						<p className="font-medium">Sales script</p>
						<p className="text-muted-foreground text-xs">{salesScriptLabel}</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Reviewer Notes</CardTitle>
					<CardDescription>
						Capture launch blockers or follow-ups that need to happen before
						approval.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Textarea
						value={reviewNotes}
						onChange={(event) => setReviewNotes(event.target.value)}
						placeholder="Example: Need compliance approval for new script before go-live."
						className="min-h-[120px]"
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default ReviewStep;
